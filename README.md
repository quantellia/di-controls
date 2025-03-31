# DI Controls Examples

Main React controls live in `di-controls-react/src/components/`.

`di-controls-react` is a bespoke decision simulation demo. To run:
- Change working directory to `di-controls-react`
- Run `npm install`
- Run `npm run dev`
- Navigate to http://localhost:5173/packing/ 

The simulation demo tries to fetch data from a Google sheet. If the Field Makeup charts are not populated:
- Refresh the page
- WAIT a few seconds without doing anything
- After a few seconds, click and drag the Field Makeup charts. Move them around randomly
- Field makeup should populate once dragged. If not, refresh the page and try again