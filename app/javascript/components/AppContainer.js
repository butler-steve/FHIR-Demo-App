import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import Chart from 'chart.js';

const defineEnum = (...args) => args.reduce((a, x) => ({...a, [x]: x}), {});
const LoadStates = defineEnum(
  'Initial',
  'Loading',
  'Complete',
);

const styles = {
  button: {
    backgroundColor: 'MediumVioletRed',
    borderWidth: 0,
    borderRadius: '50%',
    width: '16vw',
    height: '16vw',
    fontFamily: 'Arial',
    color: 'GhostWhite',
    alignSelf: 'center',
    fontSize: '1.25rem',
    fontWeight: 400,
  },
  loadingButton: {
    container: {
      marginTop: '2vw',
      alignSelf: 'center',
    },
    spinner: {
      width: '12vw',
      height: '12vw',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      marginLeft: '2vw',
    },
    text: {
      position: 'absolute',
      top: '50%',
      marginTop: '-1rem',
      alignSelf: 'center',
    },
    body: {
      width: '16vw',
      height: '16vw',
      marginTop: '-14vw',
    },
  },
  completeButton: {
    container: {
      backgroundColor: 'RebeccaPurple',
    },
  },
  ageHistogram: {
    container: {
      width: '60vw',
      height: '60vw',
      alignSelf: 'center',
      marginTop: '2rem',
    },
  },
  resultList: {
    badResult: {
      fontFamily: 'Arial',
      fontStyle: 'italic',
      color: '#555555',
      padding: '0.25rem 0.5rem',
      backgroundColor: 'rgba(100, 149, 237, 0.5)',
    },
    dataCell: {
      fontFamily: 'Arial',
      padding: '0.25rem',
      backgroundColor: 'rgba(100, 149, 237, 0.5)',
    },
    table: {
      width: '100%',
      maxHeight: '90%',
      overflow: 'auto',
    },
    tableHeader: {
      fontFamily: 'Arial',
      padding: '0.25rem',
      backgroundColor: 'DarkSlateBlue',
      color: 'white',
    },
    container: {
      height: '60vw',
      width: '60vw',
      overflow: 'auto',
      alignSelf: 'center',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      marginTop: '2rem',
    },
    filterLabel: {
      alignSelf: 'center',
      margin: '0 auto 1rem',
      fontFamily: 'Arial',
    },
  },
  resultStats: {
    container: {
       width: '80vw',
       display: 'flex',
       flexDirection: 'column',
       margin: '2rem 0 0 10vw',
    },
    text: {
      fontFamily: 'Arial',
      color: 'white',
      fontSize: '1.25rem',
      fontWeight: 600,
    },
  },
  appContainer: {
    container: {
      position: 'absolute',
      display: 'flex',
      width: '80%',
      minHeight: '100%',
      left: '10%',
      flexDirection: 'column',
      backgroundColor: 'LightBlue',
      justifyContent: 'flex-start',
      overflow: 'auto',
    },
    header: {
      fontFamily: 'Arial',
      color: 'GhostWhite',
      alignSelf: 'center',
    },
  },
};

const loadingButtonSpinnerStyles = {
  ...styles.button,
  ...styles.loadingButton.spinner,
};

const loadingButtonBodyStyles = {
  ...styles.button,
  ...styles.loadingButton.body,
};

const completeButtonContainerStyles = {
  ...styles.button,
  ...styles.completeButton.container,
};

const InitialButton = React.memo(({
  onClick,
}) => (
  <button
    style={styles.button}
    onClick={onClick}
  >
    Click to get started!
  </button>
));

const LoadingButton = React.memo(({
  resultCount,
}) => (
  <div
    style={styles.loadingButton.container}
  >
    <div
      style={loadingButtonSpinnerStyles}
    >
      <div className="lds-dual-ring"></div>
      <div
        style={styles.loadingButton.text}
      >
        {resultCount || 0} so far 
      </div>
    </div>
    <div
      style={loadingButtonBodyStyles}
    />
  </div>
));

const CompleteButton = React.memo(({
  onClick,
}) => (
  <button
    style={completeButtonContainerStyles}
    onClick={onClick}
  >
    Click to reload
  </button>
));

const ButtonClasses = {
  [LoadStates.Initial]: InitialButton,
  [LoadStates.Loading]: LoadingButton,
  [LoadStates.Complete]: CompleteButton,
};

const colours = [
    '#ffb300',
    '#ff7000',
    '#8ec500',
    '#ff86ff',
    '#ae97ff',
    '#4fcea1',
    '#be9f00',
    '#62d4e6',
    '#00bde0',
    '#ff757b',
    '#ff3190',
    '#00bd00',
];       

function calculateAge(birthday) {
  const ageDifMs = Date.now() - birthday;
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

const AgeHistogram = React.memo(({
  results,
}) => {
  const [canvasRef, setCanvasRef] = useState();
  const [chart, setChart] = useState();
  const [resultsByAge, setResultsByAge] = useState([]);

  useEffect(() => {
    if (!!results && results.length > 0) {
      const noBirthdayResults = results.filter((thisResult) => !thisResult.resource || !thisResult.resource.birthDate);
      const sortedResults = results
        .filter((thisResult) => !noBirthdayResults.includes(thisResult))
        .reduce((acc, thisResult) => {
          const birthdayAsString = thisResult.resource.birthDate;
          const age = calculateAge(new Date(birthdayAsString));
          return ({
            ...acc,
            [age]: [
              ...(acc[age] || []),
              thisResult,
            ],
          });
        }, {});
      const knownAges = Object.entries(sortedResults)
        .sort(([a], [b]) => Number(a) < Number(b))
        .map(([thisAge, resultsForAge]) => [thisAge, resultsForAge]);
      setResultsByAge([
        ...knownAges,
        ['Unknown', noBirthdayResults],
      ]);
    }
  }, [results]);

  useEffect(() => {
    if (!!canvasRef && resultsByAge.length > 0) {
      const chartColours = [];
      const numberOfBars = resultsByAge.length;
      for (let i=0; i < Math.floor(numberOfBars / colours.length) + 1; i++) {
        chartColours.push(...colours);
      }
      setChart(
        new Chart(
          canvasRef.getContext('2d'),
          {
            type: 'bar',
            data: {
                labels: resultsByAge.map(([age]) => age),
                datasets: [{
                    label: 'Results according to patient age',
                    data: resultsByAge.map(([_, val]) => val.length),
                    backgroundColor: chartColours.slice(0, numberOfBars),
                    borderColor: 'black',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            },
          },
        ),
      );
    }
  }, [canvasRef, resultsByAge]);

  return (
    !!results && results.length > 0
      ? <div
          style={styles.ageHistogram.container}
        >
          <canvas
            width='500'
            height='500'
            ref={setCanvasRef}
          />
        </div>
      : null
  );
});

const ResultList = React.memo(({
  results,
}) => {
  const [filterPediatric, setFilterPediatric] = useState(false);

  const onClick = useCallback((inputEvent) => setFilterPediatric(inputEvent.currentTarget.checked), []);
  const table = useMemo(() => {
    if (!!results && results.length > 0) {
      const rows = results.map((thisResult, rowNdx) => {
        if (!thisResult.resource
              || !thisResult.resource.name
              || !thisResult.resource.birthDate
        ) {
          return (
            <tr key={rowNdx}>
              <td
                style={styles.resultList.badResult}
              >
                Improperly formatted result
              </td>
            </tr>
          );
        }
        const dateOfBirth = new Date(thisResult.resource.birthDate);
        if (filterPediatric && calculateAge(dateOfBirth) >= 18) {
          return undefined;
        }
        const name = thisResult.resource.name.find((nameBlock) => !!nameBlock.family || !!nameBlock.given);
        const displayName = [...(name.given || []), name.family || ''].join(' ').trim();
        const displayDoB = (dateOfBirth).toLocaleDateString('en-US');
        const gender = (!!thisResult.resource.gender && thisResult.resource.gender.toLowerCase()) || 'unknown';
        const genderDescription = ({
          'male': 'Male',
          'female': 'Female',
        })[gender] || (gender.length ? 'Other' : 'Unknown');
        const {id} = thisResult.resource;

        return (
          <tr key={rowNdx}>
            {
              [displayName, displayDoB, genderDescription, id].map((fieldValue, colNdx) => (
                <td
                  style={styles.resultList.dataCell}
                  key={colNdx}
                >
                  {fieldValue}
                </td>
              ))
            }
          </tr>
        );
      }).filter(x => x !== undefined);

      return (
        <table
          style={styles.resultList.table}
        >
          <thead>
            <tr>
              {
                ['Full name', 'Date of birth', 'Gender', 'Patient Id #']
                  .map((headerName, colNdx) => (
                    <th
                      style={styles.resultList.tableHeader}
                      key={colNdx}
                    >
                      {headerName}
                    </th>
                  ))
              }
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      );
    }
  }, [results, filterPediatric]);

  return (
    !!results && results.length > 0
      ? <div
          style={styles.resultList.container}
        >
          <label
            style={styles.resultList.filterLabel}
          >
            <input
              type="checkbox"
              onClick={onClick}
            />
            Filter pediatric patients
          </label>
          { table || null }
        </div>
      : null
  );
});

const ResultStats = React.memo(({
  results,
}) => {
  const patientAges = useMemo(() =>
    (results || []).map(
      (thisResult) => {
        if (!thisResult.resource || !thisResult.resource.birthDate) {
          return undefined;
        }
        return calculateAge(new Date(thisResult.resource.birthDate));
      }
    ).filter(x => x !== undefined),
    [results]
  );

  return (
    !!results && results.length
      ? <div
          style={styles.resultStats.container}
        >
          <span
            style={styles.resultStats.text}
          >
            Number of patients: {results.length}
          </span>
          <span
            style={styles.resultStats.text}
          >
            Average age: {Math.round(patientAges.reduce((acc, age) => acc + age, 0) / patientAges.length)}
          </span>
          <span
            style={styles.resultStats.text}
          >
            Number of pediatric patients: {patientAges.filter((age) => age < 18).length}
          </span>
        </div>
      : null
  );
});

const AppContainer = React.memo(() => {
  const [loadState, setLoadState] = useState(LoadStates.Initial);
  const [results, setResults] = useState([])
  const onClick = useCallback(() => {
    setLoadState(LoadStates.Loading);
  }, []);
  useEffect(() => {
    if (loadState === LoadStates.Loading) {
      setResults([]);
      const endpoint = 'http://localhost:3000/patients/onechunk';
      let resultsSoFar = '';
      fetch(endpoint)
        .then((response) => {
          console.log('CHUNK received a chunk');
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          return readData();
          function readData() {
            return reader.read().then(function ({value, done}) {
              const newData = decoder.decode(value, {stream: !done});
              resultsSoFar += newData;
              if (done) {
                console.log('CHUNK Stream complete');
                return;
              }
              return readData();
            });
          }
        }).then(() => {
          setLoadState(LoadStates.Complete);
          setResults((previous) => {
            try {
              return [
                ...previous,
                ...JSON.parse(resultsSoFar),
              ];
            } catch (e) {
              console.error(`Invalid JSON received as response`);
              return [];
            }
          });
        });
    }
  }, [loadState]);

  const actionButton = useMemo(() => {
    const ButtonComponent = ButtonClasses[loadState];
    return (
      <ButtonComponent
        onClick={onClick}
        resultCount={results.length}
      />
    );
  }, [loadState, results.length]);

  return (
    <div
      style={styles.appContainer.container}
    >
      <h1
        style={styles.appContainer.header}
      >
        FHIR API Demo App
      </h1>
      { actionButton }
      <ResultStats results={results} />
      <ResultList results={results} />
      <AgeHistogram results={results} />
    </div>
  );
});

export default AppContainer
