import { useEffect, useRef } from "react";

function App() {
	// const fieldsExtensions = [
	//   'gid=20239935#gid=20239935',
	//   'gid=1948855152#gid=1948855152',
	//   'gid=723079312#gid=723079312',
	//   'gid=917758739#gid=917758739',
	//   'gid=2015691600#gid=2015691600',
	//   'gid=930732662#gid=930732662',
	//   'gid=2121428582#gid=2121428582',
	//   'gid=535554991#gid=535554991',
	//   'gid=285458021#gid=285458021',
	//   'gid=591732537#gid=591732537'
	// ]

	// const fieldsPromises = useRef(fieldsExtensions.map((value) => fetch(
	//   `https://docs.google.com/spreadsheets/d/1tG8a55vwriYvKbSx23KOjBLhMS-OX0oFaKzSMl9fvYI/export?format=tsv&${value}`
	// ).then((response) => response.text().then((text) => text.replace('\r\n', '\n').split('\n')))))

	const numFields = 10;
	const fields = useRef<number[][]>();
	const orderAmounts = useRef<number[]>();

	const days = 3;
	const daysArray = Array<number>(days);
	const ordersByDay = [
		{
			fields: [7, 3, 2],
			orderAmount: [5, 5, 8]
		},
		{
			fields: [0,0],
			orderAmount: [7, 10]
		},
		{
			fields: [0,0],
			orderAmount: [2, 5]
		},
	];

	const sizeBounds = [3, 5.3, 10.6, 15.9, 21.2, 28.2, 40];
	const sizeLabels = ["S", "M", "L1", "L2", "XL", "G"];
	const sizes = sizeLabels.map((value, index) => ({
		classification: value,
		lowerBound: sizeBounds[index],
		upperBound: sizeBounds[index + 1],
	}));

	const potatoesPerFieldBySize = useRef<any>();

	const storageState = sizeLabels.map((value) => ({
		classification: value,
		boxesStoredPerDay: [...daysArray.fill(0)],
	}));

	const orderReports = daysArray.map(() => ({ filled: 0, remaining: 0 }));
	const orderFieldState = ordersByDay.map((value, index) => ({
		day: index + 1,
		packed: Array.from({ length: value.fields.length }, (_, orderNumber) => ({
			order: orderNumber,
			potatoesPackedPerField: Array<number>(numFields),
		})),
	}));

	const costsPerOrder = ordersByDay.map((value, index) => ({
		day: index + 1,
		costs: Array.from({ length: value.fields.length }, (_, orderNumber) => ({
			order: orderNumber,
			fieldSwitching: 0,
			storageCosts: 0,
			wages: 0,
		})),
	}));
	const automaticallyPullFromStorage = false;

	useEffect(() => {
		fields.current = Array.from({ length: numFields }, () =>
			Array.from(
				{
					length: Math.floor(Math.random() * 300 + 800),
				},
				() => Math.random() * 37 + 3
			)
		);
	});

	useEffect(() => {
		setTimeout(() => {
			potatoesPerFieldBySize.current = fields.current?.map((field) => ({
				smalls: field.filter(
					(value) => value > sizes[0].lowerBound && value < sizes[0].upperBound
				),
				mediums: field.filter(
					(value) => value > sizes[1].lowerBound && value < sizes[1].upperBound
				),
				large1s: field.filter(
					(value) => value > sizes[2].lowerBound && value < sizes[2].upperBound
				),
				large2s: field.filter(
					(value) => value > sizes[3].lowerBound && value < sizes[3].upperBound
				),
				extraLarges: field.filter(
					(value) => value > sizes[4].lowerBound && value < sizes[4].upperBound
				),
				giants: field.filter(
					(value) => value > sizes[5].lowerBound && value < sizes[5].upperBound
				),
			}));
		}, 0);
	}, [fields, sizes]);

	console.log(potatoesPerFieldBySize);

	return <></>;
}

export default App;
