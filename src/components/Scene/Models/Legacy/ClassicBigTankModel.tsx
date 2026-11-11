'use client';

import React from 'react';
import { Tanks } from '../Tank/Tanks';
import { SolarPanel } from '../Solar/SolarPanel';
import { BatteryUnit } from '../Battery/BatteryUnit';
import { ESP32Box } from '../ESP32/ESP32Box';
import { WaterPump } from '../Pump/WaterPump';
import { Sensors } from '../Sensors/Sensors';
import { FilterHousing } from '../Filter/FilterHousing';
import { Pipes } from '../Pipes/Pipes';
import { Water } from '../Tank/Water';
import { Flows } from '../Pipes/Flows';

export const ClassicBigTankModel: React.FC = () => {
  return (
    <group name="Classic_BigTank_Prototype_Model" position={[0, -0.2, 0]}>
      <Tanks />
      <SolarPanel />
      <BatteryUnit />
      <ESP32Box />
      <WaterPump />
      <Sensors />
      <FilterHousing />
      <Pipes />
      <Water />
      <Flows />
    </group>
  );
};
