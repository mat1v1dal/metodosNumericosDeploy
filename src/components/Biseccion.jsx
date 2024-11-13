import { useState, useRef } from 'react';
import Plot from 'react-plotly.js';
import * as math from 'mathjs';
import 'mathlive'; // Importar MathLive para el campo de entrada

const BisectionMethod = () => {
  const [expression, setExpression] = useState('');
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
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
      const tol = 1e-5;
      let iter = [];
      let left = a;
      let right = b;
      let midpoint = 0;

      for (let i = 0; i < 50; i++) {
        midpoint = (left + right) / 2;
        const fLeft = f.evaluate({ x: left });
        const fMid = f.evaluate({ x: midpoint });
        
        iter.push({ left, right, midpoint, fMid });

        if (Math.abs(fMid) < tol || Math.abs(right - left) < tol) {
          setRoot(midpoint);
          break;
        }

        if (fLeft * fMid < 0) {
          right = midpoint;
        } else {
          left = midpoint;
        }
      }

      setIterations(iter);
    } catch (error) {
      console.error("Error al resolver la función:", error);
    }
  };

  return (
    <div>
      <h2>Método de Bisección</h2>

      <span>Ingrese la función f(x):</span>
      <math-field
        ref={mathFieldRef}
        onInput={handleMathFieldChange}
        style={{ border: '1px solid black', padding: '10px', minWidth: '200px' }}
        placeholder="Ingrese la función"
      ></math-field>

      <br />
      <span>Ingrese el límite inferior a: </span>
      <input
        type="number"
        placeholder="a"
        value={a}
        onChange={(e) => setA(parseFloat(e.target.value))}
      />
      <span>Ingrese el límite superior b: </span>
      <input
        type="number"
        placeholder="b"
        value={b}
        onChange={(e) => setB(parseFloat(e.target.value))}
      />
      <button onClick={handleSolve}>Calcular</button>

      {root !== null && (
        <div>
          <h3>Raíz aproximada: {root}</h3>
          <Plot
            data={[
              {
                x: math.range(a - 2, b + 2, 0.1).toArray(),
                y: math.range(a - 2, b + 2, 0.1).toArray().map((x) => math.compile(expression).evaluate({ x })),
                mode: 'lines',
                name: 'f(x)',
              },
              {
                x: iterations.map((iter) => iter.midpoint),
                y: iterations.map((iter) => iter.fMid),
                mode: 'markers',
                name: 'Aproximaciones',
                marker: { color: 'blue' },
              },
            ]}
            layout={{
              title: 'Método de Bisección',
              xaxis: { title: 'x' },
              yaxis: { title: 'f(x)' },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BisectionMethod;
