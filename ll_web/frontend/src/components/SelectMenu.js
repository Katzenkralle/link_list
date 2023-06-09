import React, { Component } from "react";
import ReactDOM from "react-dom";
import { default as ReactSelect } from "react-select";
import { components } from "react-select";
import '../../static/SelectMenu.css';

const Option = (props) => {
  return (
    <div className="custom-option">
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
        />{" "}
        <label>{props.label}</label>
      </components.Option>
    </div>
  );
};

export default class SelectMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      optionSelected: null
    };
  }

  handleChange = (selected) => {
    this.setState({
      optionSelected: selected
    });

    // Call the parent component's onChange handler and pass the selected values
    this.props.onChange(selected);
  };

  render() {
    return (
      <span
        className="d-inline-block select-menu-container"
        data-toggle="popover"
        data-trigger="focus"
        data-content="Please select account(s)"
      >
        <ReactSelect
          options={this.props.options}
          isMulti
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          components={{
            Option
          }}
          onChange={this.handleChange}
          allowSelectAll={true}
          value={this.state.optionSelected}
          styles={{
            control: (provided, state) => ({
              ...provided,
              width: "auto",
              minWidth: "15em",
              height: "2em",
              backgroundColor: "#1e1e1e",
              color: "#858382",
              border: "none",
              borderRadius: "25px",
              margin: "0.5em",
            }),
            menu: (provided, state) => ({
              ...provided,
              width: "auto",
              backgroundColor: "#1e1e1e",
              color: "#858382",
              border: "none",
              borderRadius: "25px",
              paddingBottom: "0.5em",
              margin: "0.5em",
              marginTop: "0", // Remove top margin to align with the control
            }),
            menuList: (provided, state) => ({
              ...provided,
              width: "auto",
              maxHeight: "auto", // Set a maximum height if needed
              overflow: "auto", // Enable scrolling if the menu becomes too long
            }),
            option: (provided, state) => ({
              ...provided,
              color: state.isFocused ? "black" : "#858382",
              backgroundColor: state.isFocused ? "#858382" : "transparent",
            }),
            
            multiValue: (provided, state) => ({
              ...provided,
              backgroundColor: "#858382",
              borderRadius: "25px",
            }),
            multiValueLabel: (provided, state) => ({
              ...provided,
              color: "white",
              fontWeight: "bold",
              paddingRight: "6px",
            }),
            multiValueRemove: (provided, state) => ({
              ...provided,
              color: "#ffffff",
              ':hover': {
                backgroundColor: "transparent",
                color: "red",
              },
            }),
            valueContainer: (provided, state) => ({
              ...provided,
              paddingLeft: '6px',
              paddingRight: '6px',
              margin: '-0.3em 0.5em 0em 0em',
            }),
            indicatorsContainer: (provided, state) => ({
              ...provided,
              paddingRight: '6px',
              margin: '-0.2em 0em 0em 0em'
            }),            
          }}
        />
      </span>
    );
  }
}
