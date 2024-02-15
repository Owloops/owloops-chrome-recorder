import { assert } from "chai";
import { stringifyStep } from "@puppeteer/replay";
import { OwloopsStringifyExtension } from "../src/OwloopsStringifyExtension.js";
import {
  SupportedRecorderKeysKeys,
  supportedRecorderKeys,
} from "../src/constants.js";
import { Schema, StepType, AssertedEventType } from "@puppeteer/replay";

describe("OwloopsStringifyExtension", function () {
  const extension = new OwloopsStringifyExtension();
  it("correctly exports Chrome Recorder click step", async function () {
    const step = {
      type: StepType.Click as const,
      target: "main",
      selectors: [["aria/Test"], ["#test"]],
      offsetX: 1,
      offsetY: 1,
    };
    const result = await stringifyStep(step, {
      extension,
    });

    assert.equal(
      result.toString(),
      `{\n\"action\": \"click\",\n\"options\": {\n\"querySelector\": \"#test\",\n\"rightClick\": false,\n\"preferredSelector\": \"querySelector\",\n\"ariaSelector\": \"aria/Test\",\n\"offsetX\": 1,\n\"offsetY\": 1,\n}\n},\n\n`
    );
  });

  it("correctly exports Chrome Recorder doubleClick step", async function () {
    const step = {
      type: StepType.DoubleClick as const,
      target: "main",
      selectors: [["aria/Test"], ["#test"]],
      offsetX: 1,
      offsetY: 1,
    };
    const result = await stringifyStep(step, {
      extension,
    });

    assert.equal(
      result.toString(),
      `{\n\"action\": \"click\",\n\"options\": {\n\"querySelector\": \"#test\",\n\"doubleClick\": true,\n\"preferredSelector\": \"querySelector\",\n\"ariaSelector\": \"aria/Test\",\n\"offsetX\": 1,\n\"offsetY\": 1,\n}\n},\n\n`
    );
  });

  it("correctly exports Chrome Recorder click step with right click", async function () {
    const step = {
      type: StepType.Click as const,
      target: "main",
      selectors: [["aria/Test"], ["#test"]],
      button: "secondary" as const,
      offsetX: 1,
      offsetY: 1,
    };
    const result = await stringifyStep(step, {
      extension,
    });

    assert.equal(
      result.toString(),
      `{\n\"action\": \"click\",\n\"options\": {\n\"querySelector\": \"#test\",\n\"rightClick\": true,\n\"preferredSelector\": \"querySelector\",\n\"ariaSelector\": \"aria/Test\",\n\"offsetX\": 1,\n\"offsetY\": 1,\n}\n},\n\n`
    );
  });

  it("correctly exports Chrome Recorder navigate step", async function () {
    const step = {
      type: StepType.Navigate as const,
      assertedEvents: [
        {
          type: AssertedEventType.Navigation as const,
          url: "https://owloops.readme.io/",
          title: "Coffee cart",
        },
      ],
      url: "https://owloops.readme.io/",
    };
    const result = await stringifyStep(step, {
      extension,
    });

    assert.equal(
      result.toString(),
      `{\n\"action\": \"goto\",\n\"options\": {\n\"url\": \"https://owloops.readme.io/\",\n}\n},\n`
    );
  });

  it.skip("correctly handles Chrome Recorder click step with asserted navigation", async function () {
    const step = {
      type: StepType.Click as const,
      target: "main",
      selectors: [["aria/Test"], ["#test"]],
      assertedEvents: [
        {
          type: AssertedEventType.Navigation as const,
          url: "https://owloops.readme.io/",
          title: "Coffee cart",
        },
      ],
      offsetX: 1,
      offsetY: 1,
    };
    const result = await stringifyStep(step, {
      extension,
    });

    assert.equal(
      result.toString(),
      'cy.get("#test").click();\ncy.location("href").should("eq", "https://owloops.readme.io/");\n'
    );
  });

  it.skip("correctly exports Chrome Recorder scroll step", async function () {
    const step = {
      type: StepType.Scroll as const,
      target: "main",
      x: 0,
      y: 805,
    };
    const result = await stringifyStep(step, {
      extension,
    });

    assert.equal(result.toString(), "cy.scrollTo(0, 805);\n");
  });

  it("correctly exports Chrome Recorder setViewport step", async function () {
    const step = {
      type: StepType.SetViewport as const,
      width: 843,
      height: 1041,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: false,
    };
    const result = await stringifyStep(step, {
      extension,
    });

    assert.equal(
      result.toString(),
      `{\n\"action\": \"set-viewport\",\n\"options\": {\n\"width\": 843,\n\"height\": 1041,\n}\n},\n`
    );
  });

  it("correctly exports Chrome Recorder waitForElement step", async function () {
    const step = {
      type: StepType.WaitForElement as const,
      selectors: [
        'li:nth-of-type(1) div.ikg2IXiCD14iVX7AdZo1 span',
        'xpath///*[@data-testid="result-title-a"]/span',
        'pierce/li:nth-of-type(1) div.ikg2IXiCD14iVX7AdZo1 span'
      ],
    };
    const result = await stringifyStep(step, {
      extension,
    });

    assert.equal(
      result.toString(),
      `{\n\"action\": \"wait\",\n\"options\": {\n\"for\": "querySelector",\n\"querySelector\": "li:nth-of-type(1) div.ikg2IXiCD14iVX7AdZo1 span",\n}\n},\n\n`
    );
  });

  it("correctly exports Chrome Recorder change step", async function () {
    const step = {
      type: StepType.Change as const,
      target: "main",
      selectors: [["aria/Name"], ["#name"]],
      value: "jane",
    };
    const result = await stringifyStep(step, {
      extension,
    });

    assert.equal(
      result.toString(),
      `{\n\"action\": \"input\",\n\"options\": {\n\"querySelector\": \"#name\",\n\"preferredSelector\": \"querySelector\",\n\"type\": \"input\",\n\"value\": \"jane\",\n\"ariaSelector\": \"aria/Name\",\n}\n},\n\n`
    );
  });

  it("correctly exports Chrome Recorder change step with json value", async function () {
    const step = {
      type: StepType.Change as const,
      target: "main",
      selectors: [["aria/Name"], ["#name"]],
      value: `{\n  \"name\": \"3'00 - 3'30\",\n  \"value\": \"3'00 - 3'30\",\n  \"disabled\\`,
    };
    const result = await stringifyStep(step, {
      extension,
    });

    assert.equal(
      result.toString(),
      `{\n\"action\": \"input\",\n\"options\": {\n\"querySelector\": \"#name\",\n\"preferredSelector\": \"querySelector\",\n\"type\": \"input\",\n\"value\": \"{\\n  \\\"name\\\": \\\"3'00 - 3'30\\\",\\n  \\\"value\\\": \\\"3'00 - 3'30\\\",\\n  \\\"disabled\\\\\",\n\"ariaSelector\": \"aria/Name\",\n}\n},\n\n`
    );
  });

  it("correctly handles keyDown step types that are supported", async function () {
    Object.keys(supportedRecorderKeys).map(async (key) => {
      const step = {
        type: StepType.KeyDown as const,
        target: "main",
        key: supportedRecorderKeys[
          key as SupportedRecorderKeysKeys
        ].toUpperCase() as Schema.Key,
      };
      const result = await stringifyStep(step, {
        extension,
      });

      assert.equal(
        result.toString(),
        `{\n\"action\": \"${key}\",\n\"options\": {\n}\n},\n\n`
      );
    });
  });

  it("correctly handles keyDown step type that are not supported", async function () {
    const step = {
      type: StepType.KeyDown as const,
      target: "main",
      key: "Meta" as const,
    };
    const result = await stringifyStep(step, {
      extension,
    });

    assert.equal(result.toString(), "\n");
  });

  it("correctly handles keyUp step type by ignoring it for now", async function () {
    const step = {
      type: StepType.KeyUp as const,
      target: "main",
      key: "Meta" as const,
    };
    const result = await stringifyStep(step, {
      extension,
    });

    assert.equal(result.toString(), "\n");
  });

  it.skip("correctly handles Chrome Recorder hover step", async function () {
    const step = {
      type: StepType.Hover as const,
      target: "main",
      selectors: [["aria/Test"], ["#test"]],
    };
    const result = await stringifyStep(step, {
      extension,
    });

    assert.equal(result.toString(), `cy.get("#test").trigger("mouseover");\n`);
  });
});
