import React from "react";

interface SelectProps {
  selected: string;
  options: { label: string; deviceId: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Select: React.FC<SelectProps> = ({ selected, options, onChange }) => {
  return (
    <select onChange={onChange}>
      {options.map(({ label, deviceId }) => (
        <option key={deviceId} value={selected}>
          {label}
        </option>
      ))}
    </select>
  );
};

export default Select;
