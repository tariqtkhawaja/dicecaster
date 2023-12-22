import { useState } from "react";

export const rollDie = (numberOfSides: number) => Math.floor(Math.random() * numberOfSides) + 1

export const useDice = (numberOfSides: number) => {
    const [value, setValue] = useState<number>(0);
    const [history, setHistory] = useState<number[]>([]);
    
    const roll = () => {
      let rolledResult = rollDie(numberOfSides);
      setValue(rolledResult);
      setHistory(prev => [...prev, rolledResult]);
    };

    return { history, roll, value };
};