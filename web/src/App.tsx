import { MouseEvent, SetStateAction, useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { UserSearch } from "../components/input";
import { ListItem } from "@mui/material";
import { internal_processStyles } from "@mui/styled-engine";

interface BusTime {
  id: number;
  busId: number;
  destination: string;
  minutesUntilArrival: number;
  isDue: string;
  nonOperationalDays: number[];
  nextAvailable: string;
}

const App = () => {
  const [busTimes, setBusTimes] = useState<BusTime[]>();
  const [nonOperationalBuses, setNonOperationalBuses] = useState<BusTime[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<BusTime[]>();

  //Fetching from backend to get a list of current active buses. Also sorts through results and orders them by nearest due time
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setSearchResults(undefined)
      const data = await fetch("http://localhost:3000/bus-times");
      const res: BusTime[] = await data.json();
      const now = new Date().getDay();
      res.sort((a, b) => a.minutesUntilArrival - b.minutesUntilArrival);
      setIsLoading(false);
      setBusTimes(res);
    }
    fetchData();
    setInterval(() => {
      fetchData();
    }, 10000);
  }, []);
  const now = new Date().getDay();

  //Allows user to search through results for destination - eg train station or newham close
  useEffect(() => {
    if (busTimes && search) {
      for (let i = 0; i < busTimes.length; i++) {
        if (busTimes[i].destination.toLowerCase() === search.toLowerCase()) {
          setSearchResults([busTimes[i]]);
          break;
        } else if (
          busTimes[i].destination.toLowerCase() !== search.toLowerCase()
        ) {
          setSearchResults(undefined);
        }
      }
    }
  }, [search]);
  function handleSearch(e: {
    preventDefault(): unknown;
    target: { value: SetStateAction<string> };
  }) {
    e.preventDefault();
    setSearch(e.target.value);
  }

  //Removing results that include buses not operational from the main bus time list that get's rendered
  if (busTimes) {
    busTimes.forEach((element) => {
      if (element.nonOperationalDays.includes(now)) {
        let filtered = busTimes.filter((item) => item === element);
        setNonOperationalBuses(filtered);
        setBusTimes(busTimes.filter((item) => item !== element));
      }
    });
  }

  // If there a non-operating bus is due tomorrow, display due tomorrow instead of minutes until arrival
  if (nonOperationalBuses) {
    for (let i = 0; i < nonOperationalBuses.length; i++) {
      if (nonOperationalBuses[i].nonOperationalDays.includes(now)) {
        nonOperationalBuses[i].nextAvailable = "Due Tomorrow";
      }
    }
  }

  //if the results are taking time to be fetched, display a loader
  if (isLoading)
    return (
      <div className="flex flex-col h-screen justify-center items-center gap-5">
        <h1>Loading</h1>
        <Box>
          <CircularProgress />
        </Box>
      </div>
    );

  if (searchResults !== undefined) {
    return (
      searchResults &&
      searchResults.map((e) => (
        <div className="App flex flex-col items-center">
          <UserSearch buttonText={"Search"} onChange={handleSearch} />
          <div>
            <h1>Next Bus Due</h1>
            <div className="Card">
              <div className="Card__Header">
                <b>{e.busId}</b>
              </div>
              <div className="Card__Details">
                <div>{e.destination}</div>
                {e.minutesUntilArrival > 1 ? (
                  <div>Mins: {e.minutesUntilArrival}</div>
                ) : (
                  <div>Due</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))
    );
  }

  return (
    <div className="App flex flex-col items-center">
      <UserSearch buttonText={"Search"} onChange={handleSearch} />
      <div>
        <div>
          Live bus times for <b>Park Road</b>
        </div>
        {busTimes &&
          busTimes.map((e) => (
            <div className="Card mb-2">
              <div className="Card__Header">
                <b>{e.busId}</b>
              </div>
              <div className="Card__Details">
                <div>{e.destination}</div>
                {e.minutesUntilArrival > 1 ? (
                  <div>Mins: {e.minutesUntilArrival}</div>
                ) : (
                  <div>Due</div>
                )}
              </div>
            </div>
          ))}
        <br />

        <div>Buses Not In Service</div>
        {nonOperationalBuses &&
          nonOperationalBuses.map((e) => (
            <div className="Card">
              <div className="Card__Header">
                <b>{e.busId}</b>
              </div>
              <div className="Card__Details">
                <div>{e.nextAvailable}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
export default App;
