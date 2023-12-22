import './App.css'
import { useDice } from './hooks'

function App() {
  const d20 = useDice(20)

  return (
    <>
      <h1>Hello D&D Dice Roller!</h1>
      <h2>{d20.value}</h2>
      <button onClick={() => d20.roll()}>
        Roll Dice
      </button>
      <ul>
        {d20.history?.map((roll, index) => (
          <li key={index}>{roll}</li>
        ))}
      </ul>
    </>
  )
}

export default App
