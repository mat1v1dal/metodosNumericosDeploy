import { useState, useRef } from 'react';
import Plot from 'react-plotly.js';
import * as math from 'mathjs';
import 'mathlive'; // Importar MathLive para el campo de entrada

const NewtonRaphson = () => {
  const [expression, setExpression] = useState('');
  const [x0, setX0] = useState(0);
  const [iterations, setIterations] = useState([]);
  const [root, setRoot] = useState(null);

  const mathFieldRef = useRef(null);

  const handleMathFieldChange = () => {
    const latexExpression = mathFieldRef.current.getValue();
    try {
      const parsedExpression = latexToMathJS(latexExpression);
      setExpression(parsedExpression);
    } catch (error) {
      console.error("Error al convertir LaTeX a expresión:", error);
    }
  };

  const latexToMathJS = (latex) => {
    return latex
      .replace(/\\cdot/g, '*')
      .replace(/\\frac{([^}]*)}{([^}]*)}/g, '($1)/($2)')
      .replace(/\\sqrt{([^}]*)}/g, 'sqrt($1)')
      .replace(/\\left\(/g, '(')
      .replace(/\\right\)/g, ')')
      .replace(/\\right/g, '')
      .replace(/\\left/g, '')
      .replace(/\s+/g, '');
  };

  const handleSolve = () => {
    try {
      const f = math.compile(expression);
      const df = math.derivative(expression, 'x');
      const tol = 1e-5;
      let x = x0;
      let iter = [];

      for (let i = 0; i < 50; i++) {
        const fx = f.evaluate({ x });
        const dfx = df.evaluate({ x });
        const xNew = x - fx / dfx;
        iter.push({ x, fx, xNew, dfx });

        if (Math.abs(xNew - x) < tol) {
          setRoot(xNew);
          break;
        }

        x = xNew;
      }

      setIterations(iter);
    } catch (error) {
      console.error("Error al resolver la función:", error);
    }
  };

  const generateTangents = () => {
    let tangentLines = [];

    iterations.forEach((iter) => {
      const { x, fx, dfx } = iter;
      const xTangent = math.range(x - 1.5, x + 1.5, 0.1).toArray();
      const yTangent = xTangent.map((xVal) => fx + dfx * (xVal - x));

      tangentLines.push({
        x: xTangent,
        y: yTangent,
        mode: 'lines',
        name: `Tangente en x = ${x.toFixed(2)}`,
        line: { dash: 'dash', color: 'red' },
      });
    });

    return tangentLines;
  };

  return (
    <div>
      <h2>Método de Newton-Raphson</h2>

      <math-field
        ref={mathFieldRef}
        onInput={handleMathFieldChange}
        style={{ border: '1px solid black', padding: '10px', minWidth: '200px' }}
        placeholder="Ingrese la función"
      ></math-field>

      <br />
      <span>ingrese el valor inicial: </span>
      <input
        type="number"
        placeholder="Valor inicial x0"
        value={x0}
        onChange={(e) => setX0(parseFloat(e.target.value))}
      />
      <button onClick={handleSolve}>Calcular</button>

      {root && (
        <div>
          <h3>Raíz aproximada: {root}</h3>
          <Plot
            data={[
              {
                x: math.range(x0 - 2, x0 + 4, 0.1).toArray(),
                y: math.range(x0 - 2, x0 + 4, 0.1).toArray().map((x) => math.compile(expression).evaluate({ x })),
                mode: 'lines',
                name: 'f(x)',
              },
              ...generateTangents(),
              {
                x: iterations.map((iter) => iter.x),
                y: iterations.map((iter) => iter.fx),
                mode: 'markers',
                name: 'Aproximaciones',
                marker: { color: 'blue' },
              },
            ]}
            layout={{
              title: 'Newton-Raphson con Tangentes',
              xaxis: { title: 'x' },
              yaxis: { title: 'f(x)' },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default NewtonRaphson;
