import { useState, useEffect } from 'react';
import PeopleRoles from './components/PeopleRoles';
import DeleteComponent from './components/DeleteComponent';
import ReadComponent from './components/ReadComponent';
import CreateComponent from './components/CreateComponent';
import UpdateComponent from './components/UpdateComponent';
import ResumenContrato from './components/Contratos-Empresa';
import ClientesActivos from './components/Contratos-ClientesActivos';
import Conexions from './components/Conexiones/Conexions';

export default function App() {
  
  return (
    <Conexions/>
  );
}
