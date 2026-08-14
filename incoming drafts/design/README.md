# Design deliveries land here

Design is a separate Claude product with NO access to this repo. It cannot read `inter_chat/` and
cannot write anywhere on this disk. The only transport is Smith: he pastes a brief into the Design
app, Design produces a zip, he downloads it and unpacks it **here**.

Housing reads this folder. Nothing else in the estate should assume Design can be written to.

One folder per delivery, dated, e.g. `feedback_panel_2026-08-13/`.
