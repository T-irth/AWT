import { createContext, useContext, useState, useEffect } from 'react'

// Q2: Full CRUD using localStorage
export const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
    // TODO: Student to implement tasks state + CRUD operations with localStorage
    return <TaskContext.Provider value={{}}>{children}</TaskContext.Provider>;
};