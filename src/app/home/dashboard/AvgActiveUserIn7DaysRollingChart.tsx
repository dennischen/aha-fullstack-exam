'use client'
/*
 * 
 * @author: Dennis Chen
 */

//use it in tree-shakable way to reduce js size
// import 'chart.js/auto'
import { Chart as ChartJS, CategoryScale, LineController, LineElement, PointElement, LinearScale, Colors } from 'chart.js'
ChartJS.register(CategoryScale, LineController, LineElement, PointElement, LinearScale, Colors)

import { Line } from 'react-chartjs-2'
import { ValueOnDate } from "@/app/api/v0/dto"
import { useMemo } from 'react'


type Props = {
    data: ValueOnDate<number>[]
}

export default function UserStatisticsChart({ data }: Props) {

    data = useMemo(() => {
        return data.slice().reverse()
    }, data)

    return <div style={{position: 'relative'}} >
        <Line
            data={{
                labels: data.map((vod) => vod.date),
                datasets: [
                    {
                        label: 'Avg Active User',
                        data: data.map((vod) => vod.value),
                    }
                ],
            }}
        />
    </div>
}