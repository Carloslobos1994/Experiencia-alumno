// src/context/AuthContext.js
// Contexto global de autenticacion: { usuario, autenticado, verificando, login, logout }.
import { createContext } from 'react';

export const AuthContext = createContext(null);
