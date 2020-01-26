import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Store } from "../../Store";
import { Button } from "reactstrap";

interface IMarkdownButtonsProps {
  focusEditor(): void;
}

export function MarkdownButtons(props: IMarkdownButtonsProps): JSX.Element {
  const { state, dispatch } = React.useContext(Store);

  const boldText = () => {
    modifySelection((line: string) => "**" + line + "**");
  };

  const italicText = () => {
    modifySelection((line: string) => "*" + line + "*");
  };

  const listText = () => {
    modifySelection((line: string) => "* " + line);
  };

  const indentText = () => {
    modifySelection((line: string) => "    " + line);
  };

  const undentText = () => {
    modifySelection((line: string) => line.substring(4));
  };

  const modifySelection = (lineHandler: (line: string) => string) => {
    let selectedText = getSelectedText();
    if (!selectedText) {
      return;
    }
    let lines = selectedText.split("\n");
    let result: string[] = [];
    lines.forEach(line => {
      result.push(lineHandler(line));
    });

    props.focusEditor();
    return dispatch({
      type: "UPDATE_TEXT",
      payload: state.text
        .toString()
        .split(selectedText)
        .join(result.join("\n"))
    });
  };

  const getSelectedText = (): string => {
    let selectedText = window.getSelection();
    if (selectedText) {
      return selectedText.toString();
    }
    return "";
  };
  return (
    <>
      <Button outline color="dark" size="sm" onClick={boldText}>
        <i className="fa fa-bold"></i>
      </Button>{" "}
      <Button outline color="dark" size="sm" onClick={italicText}>
        <i className="fa fa-italic"></i>
      </Button>{" "}
      <Button outline color="dark" size="sm" onClick={indentText}>
        <i className="fa fa-indent"></i>
      </Button>{" "}
      <Button outline color="dark" size="sm" onClick={undentText}>
        <i className="fa fa-outdent"></i>
      </Button>{" "}
      <Button outline color="dark" size="sm" onClick={listText}>
        <i className="fa fa-list-ul"></i>
      </Button>{" "}
    </>
  );
}
