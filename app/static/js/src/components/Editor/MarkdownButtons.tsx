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
      <Button type="button" size="small" onClick={boldText}>
        B
      </Button>{" "}
      <Button type="button" size="small" onClick={italicText}>
        I
      </Button>{" "}
      <Button type="button" size="small" onClick={listText}>
        L
      </Button>{" "}
      <Button type="button" size="small" onClick={listText}>
        L
      </Button>{" "}
    </>
  );
}
