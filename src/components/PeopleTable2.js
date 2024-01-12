import { MdContentCopy } from "react-icons/md";
import { useState } from "react";

const PeopleTable = ({ people }) => {
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [copiedPersonName, setCopiedPersonName] = useState("");
  const [copiedLinks, setCopiedLinks] = useState({}); // New state to track copied links

  const copyToClipboard = (link, personName) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopiedPersonName(personName);
      setShowCopyNotification(true);
      setCopiedLinks({ ...copiedLinks, [link]: true }); // Mark this link as copied
      setTimeout(() => {
        setShowCopyNotification(false);
      }, 3000);
    });
  };
  return (
    <div>
      {showCopyNotification && (
        <div className="copy-notification">
          Copied drawing link for {copiedPersonName}!
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th className="hide-on-mobile">Num</th>
            <th>Name</th>

            <th>Had Drawed</th>
            <th>Has Been Drawn</th>
            <th>Link for Drawing</th>
          </tr>
        </thead>
        <tbody>
          {people.map((person, index) => (
            <tr key={index}>
              <td className="hide-on-mobile">{index + 1}</td>
              <td>{person.name}</td>

              <td>{person.had_drawed ? "True" : "False"}</td>
              <td>{person.has_been_drawn ? "True" : "False"}</td>

              <td
                className={`copy-link ${
                  copiedLinks[person.link_for_drawing] ? "copied" : ""
                }`}
                onClick={() =>
                  copyToClipboard(person.link_for_drawing, person.name)
                }
              >
                Copy Link <MdContentCopy />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PeopleTable;
