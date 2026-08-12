import { t } from "i18next";
import React from "react";
import { Card, Col, Row } from "react-bootstrap";
import { useSelector } from "react-redux";

function Guide() {
  const {
    userData: { department },
  } = useSelector((state) => state.user);

  return (
    <Row className="center">
      <Col md={10}>
        <Card className="mt-4 shadow-sm rounded-2 p-4">
          <h4 className="h3 mb-0 text-capitalize mb-3">{t("guide acount")}</h4>
          {department.reciever ? (
            <video controls>
              <source
                src="/reciever.mp4"
                type="video/mp4"
              />
              <source
                src="/reciever.mp4"
                type="video/mp4"
              />
            </video>
          ) : (
            <video controls>
              <source
                src="/sender.mp4"
                type="video/mp4"
              />
              <source
                src="/sender.mp4"
                type="video/mp4"
              />
            </video>
          )}
        </Card>
      </Col>
    </Row>
  );
}

export default Guide;
