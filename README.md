# What is this branch?

This repo was originally created so that Quantellia could explore Reactive controls that could be applied to CDDs in Causal Decision Models.  
They ultimately created an example that included a complete working simulation for a complex real-world CDD, using fully bespoke rendering and simulation.

This branch was created to explore how OpenDI could go about generalizing these controls, integrating them with more general-purpose JSON Schema definitions for controls. It evolved into a working in-browser react-based decision engine.

Much of the code in this branch will move to OpenDI's CDD Authoring Tool repo once licensing on the original controls is settled.

Update: As of April 2025, the original controls are under MIT License and the OpenDI fork of this repo exists.  
I'm pushing my latest changes so that they're archived somewhere safe while I begin migrating this branch and merging it with the CDD Authoring Tool.  
The current state of this branch has the beginnings of that integration, with svelte-jsoneditor working in tandem with the React-based decision engine.

For any future visitors, check [opendi-org/cdd-authoring-tool](https://github.com/opendi-org/cdd-authoring-tool) for the latest version of this project.