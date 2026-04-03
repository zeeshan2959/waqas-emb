import { useState } from "react";
import "./calculator.css";

export default function StitchCalculator() {
  const [rows, setRows] = useState([{ baseStitches: "", repeat: 1 }]);
  const [rate, setRate] = useState("");
  const [pieces, setPieces] = useState(1);

  const repeats = [0.5, 1, 1.25, 1.5, 1.75, 2, 3, 4, 5, 6, 7];

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = field === "repeat" ? Number(value) : value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { baseStitches: "", repeat: 1 }]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const calculateRowTotal = (row) => {
    return row.baseStitches
      ? Number(row.baseStitches) * row.repeat
      : 0;
  };

  const grandTotal = rows.reduce(
    (sum, row) => sum + calculateRowTotal(row),
    0
  );

  const onePieceRate = rate
    ? (grandTotal * Number(rate)) / 1000
    : 0;

  const totalCost = onePieceRate * Number(pieces || 0);

  const format = (num) =>
    Number(num).toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div className="container">
      <div className="card-calculator">
        <h2 className="title">🧵 Embroidery Calculator</h2>

        {/* Header */}
        <div className="row header">
          <div>Base Stitches</div>
          <div>Repeat</div>
          <div>Total</div>
          <div></div>
        </div>

        {/* Rows */}
        {rows.map((row, index) => (
          <div key={index} className="row box">
            <input
              type="number"
              value={row.baseStitches}
              onChange={(e) =>
                handleChange(index, "baseStitches", e.target.value)
              }
              placeholder="e.g 10000"
              className="input"
            />

            <select
              value={row.repeat}
              onChange={(e) =>
                handleChange(index, "repeat", e.target.value)
              }
              className="input"
            >
              {repeats.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <div className="total">
              {format(calculateRowTotal(row))}
            </div>

            <button
              onClick={() => removeRow(index)}
              disabled={rows.length === 1}
              className="deleteBtn"
            >
              ✕
            </button>
          </div>
        ))}

        <button onClick={addRow} className="addBtn">
          + Add Entry
        </button>

        {/* Inputs */}
        <div className="grid2">
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="Rate per 1000"
            className="input"
          />

          <input
            type="number"
            value={pieces}
            onChange={(e) => setPieces(e.target.value)}
            placeholder="Pieces"
            className="input"
          />
        </div>

        {/* Results */}
        <div className="results">
          <div className="resultRow">
            <span>Grand Total Stitches</span>
            <span>{format(grandTotal)}</span>
          </div>

          <div className="resultRow">
            <span>One Piece Rate</span>
            <span>{format(onePieceRate)}</span>
          </div>

          <div className="resultRow totalFinal">
            <span>Total Cost</span>
            <span>{format(totalCost)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}