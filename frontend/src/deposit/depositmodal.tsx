import React, { useState, ChangeEvent } from "react";
import axios, { AxiosResponse } from "axios";
import { Modal, Button } from "react-bootstrap";
import { API_URL } from "../constants";
import "bootstrap/dist/css/bootstrap.min.css";
import "./deposit.css";
interface DepositModalProps {
  show: boolean;
  onClose: () => void;
  authkey: string;
}

const DepositModal: React.FC<DepositModalProps> = ({
  show,
  onClose,
  authkey,
}) => {
  const [value, setValue] = useState<number>(5);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const sanitizedValue = inputValue.replace(/\D/g, "");
    setValue(Number(sanitizedValue));
  };

  const onDepositClick = () => {
    if (value === undefined || value === null || value <= 0) {
      return;
    }
    axios
      .post(`${API_URL}/balance/deposit`, {
        amount: value,
        auth: authkey,
      })
      .then((response: AxiosResponse) => {
        if (response.data.success === false) {
        } else {
          console.log(response.data);
        }
      })
      .catch((error: any) => {
        console.error(error);
      });
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="xl"
      centered
      style={{ borderRadius: "50px" }}
    >
      <Modal.Header
        closeButton
        style={{ backgroundColor: "#095882", color: "white" }}
      >
        <Modal.Title className="w-100 text-center fs-3">Deposit</Modal.Title>
      </Modal.Header>
      <Modal.Body
        className="d-flex flex-column align-items-center justify-content-center rounded"
        style={{ backgroundColor: "#095882" }}
      >
        <div
          className="box d-flex flex-column align-items-center"
          style={{
            backgroundColor: "#095882",
            padding: "40px",
            borderRadius: "20px",
            width: "80%",
          }}
        >
          <input
            placeholder="Enter the amount you want to deposit"
            type="text"
            size={100}
            className="form-control form-control-lg mb-3"
            value={value}
            onChange={handleInputChange}
            style={{ height: "70px", fontSize: "1.5rem" }}
          />
          <div className="login-container">
            <Button
              variant="primary"
              onClick={onDepositClick}
              size="lg"
              style={{ height: "100px", fontSize: "3rem",width:"250px" }}
            >
              Deposit
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DepositModal;
