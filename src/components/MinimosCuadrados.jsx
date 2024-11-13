import { useState } from 'react';
import Plot from 'react-plotly.js';
import * as math from 'mathjs';

const LeastSquares = () => {
  const [points, setPoints] = useState('');
  const [slope, setSlope] = useState(null);
  const [intercept, setIntercept] = useState(null);

  const handleCalculate = () => {
    try {
      // Parse input points
      const parsedPoints = points
        .split(';')
        .map((point) => point.split(',').map(Number));

      const xValues = parsedPoints.map(([x]) => x);
      const yValues = parsedPoints.map(([_, y]) => y);

      if (xValues.length !== yValues.length || xValues.length === 0) {
        throw new Error("Formato incorrecto o sin datos");
      }

      // Construir la matriz A (con x y el término 1)
      const A = parsedPoints.map(([x]) => [x, 1]);

      // Construir la matriz B (valores de y)
      const B = yValues;

      // Calcular A^T (la transpuesta de A)
      const At = math.transpose(A);

      // Calcular A^T * A
      const AtA = math.multiply(At, A);

      // Calcular A^T * B
      const AtB = math.multiply(At, B);

      // Resolver el sistema (AtA) * X = AtB
      const X = math.lusolve(AtA, AtB);

      // Los coeficientes (pendiente a y el intercepto b)
      const a = X[0][0]; // pendiente
      const b = X[1][0]; // intercepto

      setSlope(a);
      setIntercept(b);
    } catch (error) {
      console.error("Error al calcular la recta de ajuste:", error);
    }
  };

  return (
    <div>
      <h2>Método de Mínimos Cuadrados</h2>
      <p>Ingrese los puntos en el formato "x1,y1; x2,y2; ..."</p>
      <input
        type="text"
        placeholder="Ejemplo: 40,900; 67,1800; 90,2700"
        value={points}
        onChange={(e) => setPoints(e.target.value)}
        style={{ width: '300px' }}
      />
      <button onClick={handleCalculate}>Calcular</button>

      {slope !== null && intercept !== null && (
        <div>
          <h3>Función de mejor ajuste: y = {slope.toFixed(2)}x + {intercept.toFixed(2)}</h3>
          <Plot
            data={[
              {
                x: points.split(';').map((p) => parseFloat(p.split(',')[0])),
                y: points.split(';').map((p) => parseFloat(p.split(',')[1])),
                mode: 'markers',
                name: 'Datos',
                marker: { color: 'blue' },
              },
              {
                x: points.split(';').map((p) => parseFloat(p.split(',')[0])),
                y: points.split(';').map((p) => slope * parseFloat(p.split(',')[0]) + intercept),
                mode: 'lines',
                name: 'Recta de ajuste',
                line: { color: 'red' },
              },
            ]}
            layout={{
              title: 'Ajuste de Mínimos Cuadrados',
              xaxis: { title: 'x' },
              yaxis: { title: 'y' },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LeastSquares;
