module FHIRApi
  class SuccessResponse
    attr_reader :data
    def initialize(data)
      @data = data
    end

    def success?
      true
    end
  end

  class ErrorResponse
    attr_reader :code, :details
    def initialize(code = nil, details = nil)
      @code = code
      @details = details
    end

    def error_message
      "Error status #{code}"
    end

    def success?
      false
    end
  end


  class Patients
    API_ENDPOINT = 'https://hapi.fhir.org/baseR4'.freeze

    def initialize(chunk_size, doLimitResultsToPost1950=true, max_chunks=nil)
      @chunk_size = chunk_size
      @max_chunks = max_chunks
      @doLimitResultsToPost1950 = doLimitResultsToPost1950
    end

    def call(&block)
      max_page_size = @chunk_size
      received_chunk_count = 0
      offset = 0

      page_results = []
      accumulated_results = []

      loop do
        endpoint = "#{API_ENDPOINT}/Patient?_count=#{max_page_size}&_offset=#{offset}&_format=json"
        endpoint += "&birthdate=gt1950-12-31" if @doLimitResultsToPost1950
        result = request(
          http_method: :get,
          endpoint: endpoint,
        )

        page_results = result['entry']
        break if page_results.nil?

        received_chunk_count += 1
        if block.nil?
          accumulated_results += page_results
        else
          block.call page_results
        end
        break if page_results.length < max_page_size or (!@max_chunks.nil? and received_chunk_count >= @max_chunks)

        offset += max_page_size
      end
    rescue StandardError => e 
      ErrorResponse.new(500, e)
    else
      SuccessResponse.new(accumulated_results)
    end

    private

    def client
      @_client ||= Faraday.new(API_ENDPOINT) do |client|
        client.request :url_encoded
        client.adapter Faraday.default_adapter
      end
    end

    def request(http_method:, endpoint:, params: {})
      response = client.public_send(http_method, endpoint, params)
      return Oj.load(response.body) if response.status / 100 == 2
      
      raise StandardError, "Request failed with code #{response.status}"
    end

  end
end
