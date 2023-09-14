import { useState } from "react";
import "./infobar.css";
import DepositModal from "../deposit/depositmodal";
import { Col, Row, Button } from "react-bootstrap";
import { handleExitAccount } from "../utils";
import LoginModal from "../login/index";

interface InfoBarProps {
  cookievalid: boolean;
  avurl: string | "";
  authkey: string;
  robuxamnt?: number;
}

function InfoBar(props: InfoBarProps): JSX.Element {
  const [isOpendep, setIsOpendep] = useState(false);
  const [isOpendepstring, setIsOpendepstring] = useState("Deposit");
  const [isOpenLogin, setIsOpenLogin] = useState(false);

  const handleOpendepositUI = (): void => {
    setIsOpendep(!isOpendep);
  };

  const handleOpenLoginUI = (): void => {
    setIsOpenLogin(!isOpenLogin);
  };

  return props.cookievalid !== false ? (
    <header className="infobar-container">
      <div className="navbar-brand">
        <div className="material-symbols-outlined"></div>
        <img src="src/imgs/logo.svg" alt="Logo" className="navbar-logo" />
      </div>
      <Row className="align-items-center">
        <Col xs={2}>
          <div className="avatar-profile">
            {props.avurl && (
              <div className="avatar-overlay">
                <img src={props.avurl} alt="Avatar" className="avatar-image" />
              </div>
            )}
          </div>
        </Col>
        <Col xs={2}>
          <div className="robuxcounter d-flex align-items-center">
            {props.robuxamnt}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="32"
              viewBox="0 -960 960 960"
              width="32"
              className="ms-2"
            >
              <path d="M652-416q25 0 44.5-19.5t19.5-45q0-25.5-19.5-44.5T652-544q-25 0-44.5 19T588-480.5q0 25.5 19.5 45T652-416ZM185.087-238.087v53-589.826 536.826Zm0 132.218q-31.507 0-55.362-23.356-23.856-23.355-23.856-55.862v-589.826q0-31.74 23.856-55.762 23.855-24.021 55.362-24.021h589.826q32.74 0 56.262 24.021 23.521 24.022 23.521 55.762V-646h-79.783v-128.913H185.087v589.826h589.826V-313h79.783v127.913q0 32.507-23.521 55.862-23.522 23.356-56.262 23.356H185.087ZM539.13-293q-33.434 0-54.282-20.324T464-366.141v-226.294q0-32.869 20.848-53.217T539.13-666h283.001q33.435 0 54 20.348 20.565 20.348 20.565 53.217v226.294q0 32.493-20.565 52.817-20.565 20.324-54 20.324H539.13Zm297.566-60v-253H524v253h312.696Z" />
            </svg>
          </div>
        </Col>
        <Col xs={3}>
          <Button
            className="deposit-button shadow-lg"
            onClick={handleOpendepositUI}
          >
            {isOpendep ? "Close" : isOpendepstring}
          </Button>
        </Col>
        <Col xs={3}>
          <Button
            className="logout-button btn btn-link btn-outline-primary"
            onClick={handleExitAccount}
          >
            <svg
              className=""
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              viewBox="0 -960 960 960"
              width="20"
            >
              <path d="M185.087-105.869q-32.507 0-55.862-23.356-23.356-23.355-23.356-55.862v-589.826q0-32.74 23.356-56.262 23.355-23.521 55.862-23.521h297.304v79.783H185.087v589.826h297.304v79.218H185.087Zm475.261-178.782-56.566-56.001 99.173-99.739H356.609v-79.218h344.346l-99.173-99.739 56.566-56.001L854.696-479 660.348-284.651Z" />
            </svg>
          </Button>
        </Col>
      </Row>
      {isOpendep && (
        <DepositModal
          authkey={props.authkey}
          show={isOpendep}
          onClose={handleOpendepositUI}
        />
      )}
      {isOpenLogin && (
        <LoginModal show={isOpenLogin} onClose={handleOpenLoginUI} />
      )}
    </header>
  ) : (
    <header className="infobar-container">
      <div className="infobar">
        <Button
          className="login-sidebar btn btn-link btn-outline-primary"
          onClick={handleOpenLoginUI}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="48"
            viewBox="0 -960 960 960"
            width="48"
          >
            <path d="M477.609-105.869v-79.218h297.304v-589.826H477.609v-79.783h297.304q32.74 0 56.262 23.521 23.521 23.522 23.521 56.262v589.826q0 32.507-23.521 55.862-23.522 23.356-56.262 23.356H477.609Zm-68.001-178.782-57.131-56.001 99.739-99.739H105.869v-79.218h344.347l-99.739-99.739 57.131-56.001L603.391-479 409.608-284.651Z" />
          </svg>
        </Button>
        {isOpenLogin && (
          <LoginModal show={isOpenLogin} onClose={handleOpenLoginUI} />
        )}
      </div>
      <div className="navbar-brand ">
        <img src="src/imgs/logo.svg" alt="Logo" className="navbar-logo" />
      </div>
    </header>
  );
}

export default InfoBar;
