import {  Card } from "react-bootstrap";
import { Download } from "../Icons";

const ExportCard = ({exportData}) => {
  const {title,files} = exportData
  return (
    <Card className="shadow-sm p-3">
      <div className="d-flex align-items-center justify-content-between">
        <h5 className="mb-0 fs-4">{title}</h5>
        <a href={files} className="btn btn-sm btn-light">
          <Download />
        </a>
      </div>
    </Card>
  );
};

export default ExportCard;
