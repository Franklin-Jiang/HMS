'use client'

import { Tabs, Tab } from "@nextui-org/react"
import { useState } from "react"
import PatientList from "./patients/PatientList"

export default function MainTabs() {
  const [selected, setSelected] = useState("patients")

  return (
    <div className="flex flex-col gap-4">
      <Tabs 
        selectedKey={selected} 
        onSelectionChange={(key) => setSelected(key.toString())}
        aria-label="医院管理系统标签页"
        className="w-full"
      >
        <Tab key="patients" title="患者管理">
          <div className="p-4 bg-white rounded-lg shadow">
            <PatientList />
          </div>
        </Tab>
        <Tab key="doctors" title="医生管理">
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">医生列表</h2>
            {/* 这里将添加医生管理相关组件 */}
          </div>
        </Tab>
        <Tab key="departments" title="科室管理">
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">科室列表</h2>
            {/* 这里将添加科室管理相关组件 */}
          </div>
        </Tab>
        <Tab key="rooms" title="房间管理">
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">房间列表</h2>
            {/* 这里将添加房间管理相关组件 */}
          </div>
        </Tab>
      </Tabs>
    </div>
  )
} 