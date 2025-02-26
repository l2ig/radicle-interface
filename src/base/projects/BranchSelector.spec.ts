import type { ProjectInfo } from "@app/project";

import BranchSelector from "./BranchSelector.svelte";

const project: ProjectInfo = {
  head: "e678629cd37c770c640a2cd997fc76303c815772",
  urn: "rad:git:hnrkqdpm9ub19oc8dccx44echy76hzfsezyio",
  name: "nakamoto",
  description: "Privacy-preserving Bitcoin light-client implementation in Rust",
  defaultBranch: "master",
  remotes: ["rad:git:hnrkqdpm9ub19oc8dccx44echy76hzfsezyio"],
  delegates: [
    {
      type: "direct",
      id: "hyn9diwfnytahjq8u3iw63h9jte1ydcatxax3saymwdxqu1zo645pe",
    },
  ],
};

const defaultProps = {
  project,
  branches: { master: "e678629cd37c770c640a2cd997fc76303c815772" },
  revision: "e678629cd37c770c640a2cd997fc76303c815772",
};

describe("Logic", () => {
  it("should show defaultBranch label and head commit if revision === head", () => {
    cy.mount(BranchSelector, {
      props: defaultProps,
    });
    cy.get("div.stat.branch")
      .should("be.visible")
      .should("have.text", "master");
    cy.get("div.hash.mobile")
      .should("be.visible")
      .should("have.text", "e678629");
  });
  it("if project.head is null we should get the head from branches", () => {
    cy.mount(BranchSelector, {
      props: {
        ...defaultProps,
        project: {
          ...project,
          head: null,
        },
      },
    });
    cy.get("div.stat.branch")
      .should("be.visible")
      .should("have.text", "master");
    cy.get("div.hash.mobile")
      .should("be.visible")
      .should("have.text", "e678629");
  });

  it("should show the branch dropdown if branches available", () => {
    cy.mount(BranchSelector, {
      props: {
        ...defaultProps,
        branches: {
          master: "e678629cd37c770c640a2cd997fc76303c815772",
          "feature-branch": "29e8b7b0f3019b8e8a6d9bfb0964ee78f4ff12f5",
          xyz: "debf82ef3623ec11751a993bda85bac2ff1c6f00",
        },
      },
    });
    cy.get("div.commit div.stat.branch").click();
    cy.get("div.dropdown div.dropdown-item")
      .first()
      .should("contain.text", "feature-branch")
      .next()
      .should("contain.text", "master")
      .should("have.class", "selected")
      .next()
      .should("contain.text", "xyz");
  });

  it("should show feature-branch label and head commit, if branch label is passed as revision", () => {
    cy.mount(BranchSelector, {
      props: {
        ...defaultProps,
        branches: {
          master: "e678629cd37c770c640a2cd997fc76303c815772",
          "feature-branch": "29e8b7b0f3019b8e8a6d9bfb0964ee78f4ff12f5",
          xyz: "debf82ef3623ec11751a993bda85bac2ff1c6f00",
        },
        revision: "feature-branch",
      },
    });
    cy.get("div.stat.branch")
      .should("be.visible")
      .should("have.text", "feature-branch");
    cy.get("div.hash.mobile")
      .should("be.visible")
      .should("have.text", "29e8b7b");
  });

  it("should show only commit if no branchLabel nor branches are available", () => {
    cy.mount(BranchSelector, {
      props: {
        ...defaultProps,
        revision: "debf82ef3623ec11751a993bda85bac2ff1c6f00",
        branches: {},
      },
    });
    cy.get("div.hash.mobile")
      .should("be.visible")
      .should("have.text", "debf82e");
    cy.viewport("macbook-13");
    cy.get("div.hash.desktop")
      .should("be.visible")
      .should("have.text", "debf82ef3623ec11751a993bda85bac2ff1c6f00");
  });

  it("should show only commit if branches are available but no branchLabel", () => {
    cy.mount(BranchSelector, {
      props: {
        ...defaultProps,
        revision: "debf82ef3623ec11751a993bda85bac2ff1c6f00",
      },
    });
    cy.get("div.hash.mobile")
      .should("be.visible")
      .should("have.text", "debf82e");
    cy.viewport("macbook-13");
    cy.get("div.hash.desktop")
      .should("be.visible")
      .should("have.text", "debf82ef3623ec11751a993bda85bac2ff1c6f00");
  });

  it("should show defaultBranch label if revision === head", () => {
    cy.mount(BranchSelector, {
      props: {
        ...defaultProps,
        revision: "e678629cd37c770c640a2cd997fc76303c815772",
        branches: {},
      },
    });
    cy.get("div.stat.branch.not-allowed")
      .should("be.visible")
      .should("have.text", "master");
  });
});

describe("Layout", () => {
  it("should show shortened commit when on mobile, and full hash when on desktop", () => {
    cy.mount(BranchSelector, {
      props: {
        ...defaultProps,
        revision: "e678629cd37c770c640a2cd997fc76303c815772",
      },
    });
    cy.viewport("iphone-x");
    cy.get("div.hash.mobile").should("be.visible");
    cy.get("div.hash.desktop").should("not.be.visible");
    cy.viewport("macbook-15");
    cy.get("div.hash.mobile").should("not.be.visible");
    cy.get("div.hash.desktop").should("be.visible");
  });
});

describe("Events", () => {
  it("should dispatch a 'branchChanged' event on click", () => {
    const branchChangedSpy = cy.spy().as("branchChangedSpy");

    cy.mount(BranchSelector, {
      props: {
        ...defaultProps,
        revision: "feature-branch",
        branches: {
          "feature-branch": "29e8b7b0f3019b8e8a6d9bfb0964ee78f4ff12f5",
          xyz: "debf82ef3623ec11751a993bda85bac2ff1c6f00",
        },
      },
    }).then(({ component }) => {
      component.$on("branchChanged", branchChangedSpy);
    });

    cy.get("body").contains("feature-branch").click();
    cy.get("body").contains("xyz").click();
    cy.get("@branchChangedSpy").should("have.been.called");
  });
});
