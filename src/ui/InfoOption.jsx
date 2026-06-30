import { GoChevronRight } from "react-icons/go";

function InfoOption({ label, onClick, disabled }) {
  return (
    <div
      className={`info-option${disabled ? " info-option--disabled" : ""}`}
      onClick={!disabled ? onClick : undefined}
    >
      <span>{label}</span>
      <GoChevronRight size={14} className="opacity-40" />
    </div>
  );
}

export default InfoOption;
