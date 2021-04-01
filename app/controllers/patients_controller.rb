class APIResponder < ActionController::Responder
  private

  def display(resource, options = {})
    super(resource.data, options)
  end

  def has_errors?
    !resource.success?
  end

  def json_resource_errors
    { error: resource.error, message: resource.error_message, code: resource.code, details: resource.details }
  end

  def api_location
    nil
  end
end

class PatientsController < ApplicationController
  include ActionController::Live
  respond_to :json

  def streamed_transfer(chunk_size=500, doLimitResultsToPost1950=true, max_chunks=nil)
     response.headers['Content-Type'] = 'application/json'
    # sse = SSE.new(response.stream, retry: 300, event: "patient-chunk") 
 
    result = FHIRApi::Patients.new(chunk_size, doLimitResultsToPost1950, max_chunks).call do |chunk|
      puts "CHUNK received: #{chunk.length}"
      response.stream.write chunk.to_json
    end
  ensure
    response.stream.close
    # sse.close
  end

  def stream
    result = self.streamed_transfer()
    respond_with result 
  end

  def onechunk
    response.headers['Content-Type'] = 'application/json'
    result = FHIRApi::Patients.new(500, true, 1).call
    respond_with result 
  end

  def all
    response.headers['Content-Type'] = 'application/json'
    result = FHIRApi::Patients.new().call
    respond_with result 
  end

  def self.responder
    APIResponder
  end
end

