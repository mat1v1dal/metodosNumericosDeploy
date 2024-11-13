import { useState } from 'react';
import NewtonRaphson from './components/NewtonRaphson';
import BisectionMethod from './components/Biseccion';
import LeastSquares from './components/MinimosCuadrados';
import LagrangeInterpolation from './components/LagrangeInterpolation';
import IntegrationMethods from './components/Integracion';
import DifferentialEquationsSolver from './components/EcDiferenciales';
import NumericalDifferentiation from './components/Derivadas';
 // Similar estructura para otros métodos

const App = () => {
  const [method, setMethod] = useState(null);

  return (
    <div className="menu-container">
      <h1>Software de Métodos Numéricos</h1>
      <button onClick={() => setMethod('newton')}>Newton-Raphson</button>
      <button onClick={() => setMethod('bisection')}>Bisección</button>
      <button onClick={() => setMethod('minimos')}>Minimos Cuadrados</button>
      <button onClick={() => setMethod('lagrange')}>Interpolación de Lagrange</button>
      <button onClick={() => setMethod('integracion')}>Integracion numerica</button>
      <button onClick={() => setMethod('diferenciales')}>Ecuaciones diferenciales</button>
      <button onClick={() => setMethod('derivada')}>Derivacion numerica</button>
      {method === 'newton' && <NewtonRaphson />}
      {method === 'bisection' && <BisectionMethod />}
      {method === 'minimos' && <LeastSquares />}
      {method === 'lagrange' && <LagrangeInterpolation />}
      {method === 'integracion' && <IntegrationMethods/>}
      {method === 'diferenciales' && <DifferentialEquationsSolver />}
      {method === "derivada" && <NumericalDifferentiation />}
    </div>
  );
};

export default App;
