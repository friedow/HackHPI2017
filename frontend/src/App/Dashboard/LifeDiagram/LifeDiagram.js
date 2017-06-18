import React, {Component} from "react";
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceArea} from "recharts";
import "./../Dashboard.css";
import {connect, PromiseState} from "react-refetch";
import settings from "../../../settings";
import AreaLabel from "./AreaLabel";
import data from "../../../data/mocked_data.json";

class LifeDiagram extends Component {
	constructor() {
		super();
		this.data = data;
	}

	componentDidUpdate() {
        setTimeout(function(){
            Array.from(document.getElementsByClassName("recharts-reference-area-rect")).forEach(item => {
                if(item.nextSibling) {
                    const x = parseFloat(item.getAttribute("x"));
                    const y = parseFloat(item.getAttribute("y"));
                    const width = parseFloat(item.getAttribute("width")) / 2;
                    const height = parseFloat(item.getAttribute("height") / 3);
                    item.nextSibling.firstChild.setAttribute("x", width + x);
                    item.nextSibling.firstChild.setAttribute("y", height + y);
                }
            });
		}, 3000);
	}

	render() {
        const { data, events } = this.props;

        const allFetches = PromiseState.all([data, events])

        if (allFetches.pending) {
            return <div>Loading...</div>;
        } else if (allFetches.rejected) {
            return <span>{allFetches.reason}</span>;
        } else if (allFetches.fulfilled) {
            return (
				<ResponsiveContainer height={300}>
					<AreaChart
						data={data.value}
						margin={{top: 20, right: 30, left: 0, bottom: 0}}>
						<XAxis xAxisId={0} dataKey="DATE"/>
						<CartesianGrid strokeDasharray="3 3"/>
						<Tooltip />
                        {this.props.selectedKeys.map((datakey, index) => {
                            return (<YAxis yAxisId={datakey} hide={true} key={`yaxis`+index.toString()}/>);
                        })}
                        {this.props.selectedKeys.map((datakey, index) => {
                            return (
								<Area type="monotone" dataKey={datakey} yAxisId={datakey} stroke="#8884d8"
									  fill="#8884d8" key={`area`+index.toString()}/>
                            );
                        })}
						{events.value.map((dataEvent, index) => {
							const startDateString = new Date(dataEvent["DATE_START"]).toISOString().split("T")[0];
                            const endDateString = new Date(dataEvent["DATE_END"]).toISOString().split("T")[0];
							return (
								<ReferenceArea
									xAxisId={0}
									yAxisId={this.props.selectedKeys[0]}
									x1={startDateString}
									x2={endDateString}
									label={<AreaLabel label={dataEvent["TITLE"]} />}
									key={`refArea`+index.toString()}
									stroke="red"
									strokeOpacity={0.3} />
							);
						})}
					</AreaChart>
				</ResponsiveContainer>
            );
        }
	}
}


export default connect(props => ({
	events: settings.backendUrl + `/user/${props.userId}/events/`,
	data: settings.backendUrl + `/user/${props.userId}/data/${props.selectedKeys.join("+")}/start/${props.startDate}/end/${props.endDate}`
}))(LifeDiagram)
