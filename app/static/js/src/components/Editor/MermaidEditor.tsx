import * as React from "react";
import mermaid from "mermaid";
import * as debounce from "debounce";
import { Input, Row, Col } from "reactstrap";

export class MermaidEditor extends React.Component {
  handleChange = debounce(
    (value: string) => {
      value = "graph LR\n" + value;
      console.log(value);
      var output = document.getElementById("output");
      try {
        mermaid.parse(value);
        if (output) {
          output.innerHTML = "";
        }
        mermaid.render("theGraph", value, function(svgCode: string) {
          console.log(svgCode);
          output!.innerHTML = svgCode;
        });
      } catch (err) {
        console.error(err);
      }
    },
    600,
    false
  );

  componentDidMount() {
    var output = document.getElementById("output");
    mermaid.initialize({ startOnLoad: true });
    var graphDefinition = `graph LR
        a-->b
        b-->a`;
    mermaid.render("theGraph", graphDefinition, function(svgCode) {
      output!.innerHTML = svgCode;
    });
  }

  render() {
    return (
      <>
        <Input
          type="textarea"
          onChange={e => this.handleChange(e.target.value)}
        ></Input>
        <div id={"output"}></div>
      </>
    );
  }
}
