import {
  LineWriter,
  Schema,
  StringifyExtension,
  StepType,
} from "@puppeteer/replay";

import {
  SupportedRecorderKeysKeys,
  supportedRecorderKeys,
} from "./constants.js";

export class OwloopsStringifyExtension extends StringifyExtension {
  async beforeAllSteps(out: LineWriter, flow: Schema.UserFlow): Promise<void> {
    out.appendLine(`[`);
  }

  async afterAllSteps(out: LineWriter): Promise<void> {
    out.appendLine("]");
  }

  async stringifyStep(
    out: LineWriter,
    step: Schema.Step,
    flow: Schema.UserFlow
  ): Promise<void> {
    this.#appendStepType(out, step, flow);

    if (step.assertedEvents) {
      // TODO: handle assertions
    }
  }

  #appendStepType(
    out: LineWriter,
    step: Schema.Step,
    flow: Schema.UserFlow
  ): void {
    switch (step.type) {
      case StepType.Click:
        return this.#appendClickStep(out, step, flow);
      case StepType.DoubleClick:
        return this.#appendDoubleClickStep(out, step, flow);
      case StepType.Change:
        return this.#appendChangeStep(out, step, flow);
      case StepType.SetViewport:
        return this.#appendViewportStep(out, step);
      case StepType.Scroll:
        return this.#appendScrollStep(out, step, flow);
      case StepType.Navigate:
        return this.#appendNavigationStep(out, step);
      case StepType.KeyDown:
        return this.#appendKeyDownStep(out, step);
      case StepType.Hover:
        return this.#appendHoverStep(out, step, flow);
      case StepType.KeyDown:
        return;
    }
  }

  #appendChangeStep(
    out: LineWriter,
    step: Schema.ChangeStep,
    flow: Schema.UserFlow
  ): void {
    const cySelector = handleSelectors(step.selectors, flow);
    const ariaSelector = ariaSelectors(step.selectors);
    const xpathSelector = xpathSelectors(step.selectors);
    const textSelector = textSelectors(step.selectors);

    if (cySelector) {
      const props = [];
      props.push(["querySelector", cySelector]);
      props.push(["preferredSelector", `"querySelector"`]);
      props.push(["type", `"input"`])
      props.push(["value", `"${step.value}"`]);
      if (ariaSelector) {
        props.push(["ariaSelector", ariaSelector]);
      }
      if (xpathSelector) {
        props.push(["xpathSelector", xpathSelector]);
      }
      if (textSelector) {
        props.push(["textSelector", textSelector]);
      }
      formatOwlJson(out, "input", props);
    }

    out.appendLine("");
  }

  #appendClickStep(
    out: LineWriter,
    step: Schema.ClickStep,
    flow: Schema.UserFlow
  ): void {
    const cySelector = handleSelectors(step.selectors, flow);
    const hasRightClick = step.button && step.button === "secondary";
    const ariaSelector = ariaSelectors(step.selectors);
    const xpathSelector = xpathSelectors(step.selectors);
    const textSelector = textSelectors(step.selectors);

    const props = [];
    props.push(["querySelector", cySelector]);
    props.push(["rightClick", hasRightClick || false]);
    props.push(["preferredSelector", `"querySelector"`]);
    if (ariaSelector) {
      props.push(["ariaSelector", ariaSelector]);
    }
    if (xpathSelector) {
      props.push(["xpathSelector", xpathSelector]);
    }
    if (textSelector) {
      props.push(["textSelector", textSelector]);
    }
    if (step.offsetX) {
      props.push(["offsetX", step.offsetX]);
    }
    if (step.offsetY) {
      props.push(["offsetY", step.offsetY]);
    }
    if (cySelector) {
      formatOwlJson(out, "click", props);
    } else {
      console.log(
        `Warning: The click on ${step.selectors[0]} was not able to be exported to Owloops. Please adjust your selectors and try again.`
      );
    }

    out.appendLine("");
  }

  #appendDoubleClickStep(
    out: LineWriter,
    step: Schema.DoubleClickStep,
    flow: Schema.UserFlow
  ): void {
    const cySelector = handleSelectors(step.selectors, flow);
    const ariaSelector = ariaSelectors(step.selectors);
    const xpathSelector = xpathSelectors(step.selectors);
    const textSelector = textSelectors(step.selectors);

    const props = [];
    props.push(["querySelector", cySelector]);
    props.push(["preferredSelector", `"querySelector"`]);
    if (ariaSelector) {
      props.push(["ariaSelector", ariaSelector]);
    }
    if (xpathSelector) {
      props.push(["xpathSelector", xpathSelector]);
    }
    if (textSelector) {
      props.push(["textSelector", textSelector]);
    }
    if (step.offsetX) {
      props.push(["offsetX", step.offsetX]);
    }
    if (step.offsetY) {
      props.push(["offsetY", step.offsetY]);
    }

    if (cySelector) {
      formatOwlJson(out, "click", props);
    } else {
      console.log(
        `Warning: The click on ${step.selectors[0]} was not able to be exported to Owloops. Please adjust your selectors and try again.`
      );
    }

    out.appendLine("");
  }

  #appendHoverStep(
    out: LineWriter,
    step: Schema.HoverStep,
    flow: Schema.UserFlow
  ): void {
    const cySelector = handleSelectors(step.selectors, flow);

    if (cySelector) {
      // TODO: handle hover step
    }

    out.appendLine("");
  }

  #appendKeyDownStep(out: LineWriter, step: Schema.KeyDownStep): void {
    const pressedKey = step.key.toLowerCase() as SupportedRecorderKeysKeys;

    if (pressedKey in supportedRecorderKeys) {
      const keyValue = supportedRecorderKeys[pressedKey];
      formatOwlJson(out, keyValue, [[]]);
      out.appendLine("");
    }
  }

  #appendNavigationStep(out: LineWriter, step: Schema.NavigateStep): void {
    formatOwlJson(out, "goto", [["url", `"${step.url}"`]]);
  }

  #appendScrollStep(
    out: LineWriter,
    step: Schema.ScrollStep,
    flow: Schema.UserFlow
  ): void {
    if ("selectors" in step) {
      // TODO: handle scrollTo
    } else {
    }
    out.appendLine("");
  }

  #appendViewportStep(out: LineWriter, step: Schema.SetViewportStep): void {
    formatOwlJson(out, "set-viewport", [
      ["width", step.width],
      ["height", step.height],
    ]);
  }
}

function formatOwlJson(out: LineWriter, action: string, options: any[][]) {
  out.appendLine(`{`);
  out.appendLine(`"action": "${action}",`);

  out.appendLine(`"options": {`);
  if (options[0].length > 0) {
    options.forEach((option) => {
      out.appendLine(`"${option[0]}": ${option[1]},`);
    });
    out.appendLine(`}`);
  } else {
    out.appendLine(`}`);
  }
  out.appendLine(`},`);
}

function formatAsJSLiteral(value: string) {
  return JSON.stringify(value);
}

function filterArrayByString(selectors: Schema.Selector[], value: string) {
  return selectors.filter((selector) =>
    value === "aria/"
      ? !selector[0].includes(value)
      : selector[0].includes(value)
  );
}

function handleSelectors(
  selectors: Schema.Selector[],
  flow: Schema.UserFlow
): string | undefined {
  // Remove Aria selectors in favor of DOM selectors
  const nonAriaSelectors = filterArrayByString(selectors, "aria/");
  let preferredSelector;

  // Give preference to user-specified selectors
  if (flow.selectorAttribute) {
    preferredSelector = filterArrayByString(
      nonAriaSelectors,
      flow.selectorAttribute
    );
  }
  if (preferredSelector && preferredSelector[0]) {
    return `${formatAsJSLiteral(preferredSelector[0][0])}`;
  } else {
    return `${formatAsJSLiteral(nonAriaSelectors[0][0])}`;
  }
}

function ariaSelectors(selectors: Schema.Selector[]): string | undefined {
  const ariaSelectors = selectors.filter((selector) =>
    selector[0].includes("aria/")
  );
  let ariaSelector;
  if (ariaSelectors.length > 0) {
    ariaSelector = formatAsJSLiteral(ariaSelectors[0][0]);
  }
  return ariaSelector;
}

function xpathSelectors(selectors: Schema.Selector[]): string | undefined {
  const xpathSelectors = selectors.filter((selector) =>
    selector[0].includes("xpath/")
  );
  let xpathSelector;
  if (xpathSelectors.length > 0) {
    xpathSelector = formatAsJSLiteral(xpathSelectors[0][0]);
  }
  return xpathSelector;
}

function textSelectors(selectors: Schema.Selector[]): string | undefined {
  const textSelectors = selectors.filter((selector) =>
    selector[0].includes("text/")
  );
  let textSelector;
  if (textSelectors.length > 0) {
    textSelector = formatAsJSLiteral(textSelectors[0][0]);
  }
  return textSelector;
}

function assertAllValidStepTypesAreHandled(step: Schema.Step): void {
  console.log(
    `Warning: Owloops does not currently handle migrating steps of type: ${step.type}. Please check the output to see how this might affect your test.`
  );
}
