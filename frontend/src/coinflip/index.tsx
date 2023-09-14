import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import "./coins.css";

interface CoinflipProps {
  closeModal: () => void;
}

const Coinflip: React.FC<CoinflipProps> = ({ closeModal }) => {

  const [showModal, setShowModal] = useState(true); 
  const [timeBeforeFlip, setTimeBeforeFlip] = useState<number>(3);
  const [coinClass, setCoinClass] = useState<string>("");
  const [coinFlipped, setCoinFlipped] = useState<boolean>(false);

  useEffect(() => {
    if (timeBeforeFlip > 0) {
      const timer = setTimeout(() => {
        setTimeBeforeFlip((prevCount) => prevCount - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeBeforeFlip === 0 && !coinFlipped) {
      const decidedSide = Math.random();
      setCoinFlipped(true);
      if (decidedSide > 0.5) {
        setCoinClass("animate-tails");
      } else {
        setCoinClass("animate-heads");
      }
      setTimeout(() => {
        setCoinClass("");
        setShowModal(false);
        closeModal();
      }, 5000);
    }
  }, [timeBeforeFlip, coinFlipped]);



  return (
    <div className="box-container">
      <div className="box">
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Start Coin Flip
        </Button>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Coin Flip</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h1 className="timebeforecount">{timeBeforeFlip}</h1>
            <div id={coinClass} className="coin">
              <div className="heads"></div>
              <div className="tails"></div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Coinflip;
