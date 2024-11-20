"use client"

import { useEffect , useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"

const feesData = {
  btech: {
    total: 5000000,
    courses: {
      Computer: 2000000,
      Electrical: 800000,
      Mechanical: 1200000,
      Civil: 1000000,
    },
  },
  mtech: {
    total: 3000000,
    courses: {
      Computer: 1500000,
      Electrical: 400000,
      Mechanical: 600000,
      Civil: 500000,
    },
  },
  phd: {
    total: 1000000,
    courses: {
      Computer: 400000,
      Electrical: 150000,
      Mechanical: 250000,
      Civil: 200000,
    },
  },
}

const collectionTrends = [
  { month: "Jan", btech: 400000, mtech: 250000, phd: 80000 },
  { month: "Feb", btech: 450000, mtech: 280000, phd: 90000 },
  { month: "Mar", btech: 500000, mtech: 300000, phd: 100000 },
  { month: "Apr", btech: 480000, mtech: 290000, phd: 95000 },
  { month: "May", btech: 520000, mtech: 310000, phd: 105000 },
  { month: "Jun", btech: 550000, mtech: 330000, phd: 110000 },
]

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

const DegreeCard = ({ degree, data, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{degree.toUpperCase()}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-custom-selectedPurple">{formatCurrency(data.total)}</div>
      <p className="text-xs text-muted-foreground">Total fees collected</p>
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Course Breakdown</h4>
        <ul className="space-y-1">
          {Object.entries(data.courses).map(([course, amount]) => (
            <li key={course} className="flex justify-between text-sm">
              <span>{course}</span>
              <span>{formatCurrency(amount)}</span>
            </li>
          ))}
        </ul>
      </div>
    </CardContent>
  </Card>
)

export default function TotalFeesCollected() {

  // const [data,setData] = useState(null);

  // useEffect( () => {
  //   fetch("http://localhost:3000/api/finance-admin/overview")
  //    .then((response) => response.json())
  //    .then((res) => {
  //     setData(res.data);
  //    })
  //    .catch((err)=>{
  //     console.log(err.message);
  //    });
  // },[]);

  return (
    <div className="space-y-4 p-3">
      <h2 className="text-3xl font-bold">Total Fees Collected</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DegreeCard degree="BTech" data={feesData.btech} icon={GraduationCap} />
        <DegreeCard degree="MTech" data={feesData.mtech} icon={GraduationCap} />
        <DegreeCard degree="PhD" data={feesData.phd} icon={GraduationCap} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Collection Trends</CardTitle>
          <CardDescription>Monthly fee collection trends by degree</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collectionTrends}>
                <XAxis dataKey="month" />
                <YAxis />
                <Bar dataKey="btech" stackId="a" fill="#5a189a" />
                <Bar dataKey="mtech" stackId="a" fill="#7b2cbf" />
                <Bar dataKey="phd" stackId="a" fill="#9d4edd" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}