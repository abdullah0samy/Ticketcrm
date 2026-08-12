import React from "react";
import { Carousel, Accordion, Image } from "react-bootstrap";
import { useTranslation } from 'react-i18next';

function SliderTicket({ images }) {
  const { i18n } = useTranslation();

  return (
    <Accordion
      className="filter card mb-2"
      defaultActiveKey="1"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <Accordion.Item className="border-0" eventKey="0">
        <Accordion.Header className="fs-6">show screen ticket</Accordion.Header>
        <Accordion.Body className="p-0">
          <Carousel className="w-100 center" touch interval={null}>
            {images.length !== 0
              ? images.map((item) => {
                  return (
                    <Carousel.Item key={item.id}>
                      <Image className="d-block w-100" src={item.image} />
                    </Carousel.Item>
                  );
                })
              : null}
          </Carousel>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

export default SliderTicket;
