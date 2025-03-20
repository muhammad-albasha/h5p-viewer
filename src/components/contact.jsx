import React from "react";

const Contact = () => {
  return (
    <div className="container mt-4">
      <h2>Kontakt</h2>
      <p>
        Ansprechpartnerin:<br></br>{" "}
        <p style={{ fontWeight: "bold" }}>Dr. Heike Seehagen-Marx</p>
        <br></br>
        <span>
          Bergische Universität Wuppertal<br></br>
          <br></br> Zentrum für Informations- und Medienverarbeitung (ZIM)
        </span>{" "}
        <span> </span>
        <a
          target="_blank"
          className="Link"
          href="https://medialab.uni-wuppertal.de"
          rel="noreferrer"
        >
          Medienlabor
        </a>
        <br></br>
        <br></br>Tel.: 0202- 439 2028<br></br>
        <br></br>{" "}
        <a className="Link" href="mailto:h.seehagen-marx@uni-wuppertal.de">
          h.seehagen-marx@uni-wuppertal.de
        </a>
      </p>
    </div>
  );
};

export default Contact;
