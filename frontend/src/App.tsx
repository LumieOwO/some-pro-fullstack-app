import React, { useState, useEffect } from "react";
import { Button, Spinner, Form, Card } from "react-bootstrap";
import axios, { AxiosResponse } from "axios";
import InfoBar from "./infobar/index";
import { API_URL } from "./constants";
import "./app.css";
import "./coinflip/coins.css";
import {
  checkAuthTokenCookie,
  connectWebSocket,
  sendWebSocketMessage,
} from "./utils";

interface AppProps {}

interface ResponseData {
  success?: boolean;
  message?: string;
  token?: string;
  headshot?: string | "";
  id?: string;
  username?: string;
  imageUrl?: string | undefined;
  robuxamount?: number;
}

interface Match {
  id: number;
  name: string;
  details: {
    startColor: string;
    betAmount: number;
    ownerheadshop?: string;
    CoinClass?: string;
  };
}

interface GameInfo {
  ownerId: string;
  betAmount: number;
  startColor: string;
  roomId: string;
}
let matchesdictionary: {
  [key: number]: Match;
} = {};
const App: React.FC<AppProps> = React.memo(() => {
  const [isValid, setIsValid] = useState<boolean>(false);
  const [color, setColor] = useState("red");
  const [cookie, setCookie] = useState<string>("");
  const [robuxAmnt, setRobuxAmnt] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rendered, setRendered] = useState<boolean>(false);
  const [generalAccountSettings, setGeneralAccountSettings] =
    useState<ResponseData | null>(null);
  const [matches, setMatches] = useState<{ [key: number]: Match }>({});

  const handleColorClick = (selectedColor: string) => {
    setColor(selectedColor);
  };

  const handleSockMessage = (message: string) => {
    if (message.startsWith("69/loadoldgames")) {
      const gameData = message.substring("69/loadoldgames".length).trim();
      const games: Record<string, GameInfo> = JSON.parse(gameData);

      const newMatches: { [key: number]: Match } = Object.keys(games).reduce(
        (acc, roomId) => {
          const gameInfo = games[roomId];
          const newMatch: Match = {
            id: parseInt(gameInfo.roomId),
            name: `Match ${gameInfo.roomId}`,
            details: gameInfo,
          };
          acc[parseInt(roomId)] = newMatch;
          return acc;
        },
        {}
      );
      setMatches(newMatches);
    } else if (message.startsWith("69/gamecreated")) {
      const gameParse: GameInfo = JSON.parse(
        message.split("69/gamecreated")[1]
      );
      const gameId = gameParse.roomId;

      const newMatch: Match = {
        id: parseInt(gameId),
        name: `Match ${gameId}`,
        details: gameParse,
      };

      // Update the matches dictionary by adding the new match with the ID as key
      setMatches((prevMatches) => ({
        ...prevMatches,
        [newMatch.id]: newMatch,
      }));
    } else if (message.startsWith("69/roominfo")) {
      const parsedMessage = JSON.parse(message.split("69/roominfo")[1]);
      let decidedSide: number = parsedMessage.name;
      const uuid: string = parsedMessage.roomId;
      const matchToUpdate = Object.values(matchesdictionary).find(
        (match) => match.id === parseInt(uuid)
      );
      if (matchToUpdate) {
        const updatedMatch: Match = {
          ...matchToUpdate,
          details: {
            ...matchToUpdate.details,
            CoinClass: decidedSide > 0.5 ? "animate-tails" : "animate-heads",
          },
        };

        // Update the match in the matches dictionary
        setMatches((prevMatches) => ({
          ...prevMatches,
          [updatedMatch.id]: updatedMatch,
        }));
      }
    } else if (message.startsWith("69/remove")) {
      const parsedMessage: string = message.split("69/remove")[1];
      const roomIdToRemove: number = parseInt(parsedMessage);

      delete matchesdictionary[roomIdToRemove];

      setMatches((prevMatches) => {
        const newMatches = { ...prevMatches };
        delete newMatches[roomIdToRemove];
        return newMatches;
      });
    }
  };

  const handleBetAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBetAmount(parseInt(event.target.value));
  };
  useEffect(() => {
    // Convert matches object to matchesdictionary
    let newDictionary: any = {};
    Object.values(matches).forEach((match) => {
      newDictionary[match.id] = match;
    });
    matchesdictionary = newDictionary;
  }, [matches]);
  useEffect(() => {
    if (rendered) return;
    connectWebSocket("ws://localhost:4324", handleSockMessage);
    setRendered(true);
  }, [rendered]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      const cookie: string | false = checkAuthTokenCookie();
      if (!cookie) {
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      try {
        setCookie(cookie);
        const response: AxiosResponse<ResponseData> =
          await axios.post<ResponseData>(
            `${API_URL}/auth/validauthkey`,
            {
              data: {
                cookie: cookie,
              },
            },
            {
              withCredentials: true,
            }
          );
        if (response.data.success === true) {
          setIsValid(true);
          setAvatarUrl(response.data.headshot || "");
          setRobuxAmnt(response.data.robuxamount || 0);
          setGeneralAccountSettings(response.data);
        } else {
          console.log(response.data.message);
        }
      } catch (error: any) {
        if (error.message) {
          console.error("Error:", error.message);
        } else {
          console.error("Error:", error);
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const sendMatchCreate = () => {
    if (betAmount <= 9) {
      return;
    }
    const gamerjson = {
      ownerheadshop: generalAccountSettings?.headshot,
      betAmount: betAmount,
      starterColor: color,
    };
    sendWebSocketMessage(`69/create${JSON.stringify(gamerjson)}`);
  };
  const sendMatchJoin = (id: number) => {
    sendWebSocketMessage(`69/join${id}`);
  };
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };
  return (
    <div className="app">
      <InfoBar
        robuxamnt={robuxAmnt}
        cookievalid={isValid}
        avurl={avatarUrl}
        authkey={cookie}
      />
      <div className="shadow p-3 match-container">
        {isValid && (
          <div className="match-header d-flex align-items-center justify-content-between ">
            <Button
              className="btn btn-primary rounded-pill shadow"
              size="lg"
              onClick={sendMatchCreate}
            >
              Create
            </Button>
            <Form
              onSubmit={handleFormSubmit}
              className="d-flex align-items-center"
            >
              <Form.Group className="me-2 shadow-lg">
                <Form.Control
                  type="number"
                  value={betAmount}
                  onChange={handleBetAmountChange}
                  placeholder="10"
                  min="10"
                />
              </Form.Group>
              <Form.Group className="me-2">
                <div className="color-selection d-flex">
                  <div
                    className={`color-block-red choosing-badge ${
                      color === "red" ? "selected" : ""
                    }`}
                    onClick={() => handleColorClick("red")}
                  ></div>
                  <div
                    className={`color-block-green choosing-badge ${
                      color === "green" ? "selected" : ""
                    }`}
                    onClick={() => handleColorClick("green")}
                  ></div>
                </div>
              </Form.Group>
            </Form>
          </div>
        )}
        <div className="match-scroll-container">
          <div className="match-list">
            {Object.values(matches).map((match) => (
              <Card key={match.id} className="match-item mb-2 p-1">
                <Card.Body className="">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="image-container">
                      <img
                        className="imageheadshot"
                        src={match.details.ownerheadshop}
                      />
                      {match.details.CoinClass ? (
                        <div id={match.details.CoinClass} className="coin">
                          <div className="heads"></div>
                          <div className="tails"></div>
                        </div>
                      ) : (
                        <div className="coin">
                          <div className="heads"></div>
                          <div className="tails"></div>
                        </div>
                      )}
                    </div>
                    <div className="match-details">
                      <div className="match-bet-amount">
                        ${""}
                        <span className="match-bet-amount-num">
                          {match.details.betAmount}
                        </span>
                      </div>
                      <div className="badge-container">
                        {match.details.startColor === "red" ? (
                          <span className="badge bg-danger choosing-badge">
                            {" "}
                          </span>
                        ) : (
                          <span className="badge bg-success choosing-badge">
                            {" "}
                          </span>
                        )}
                      </div>
                      <Button
                        className="shadow"
                        onClick={() => sendMatchJoin(match.id)}
                        variant="primary"
                      >
                        Join
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default App;
