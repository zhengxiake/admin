import React, { Component } from 'react';
import { Rate, Progress } from 'antd'
import { json } from '../../utils/ajax'
import { connect } from 'react-redux'

const store = connect(
    (state) => ({ user: state.user })
)

@store
class Score extends Component {
    state = {
        isScored: false,    //是否已经评过分
        scores: [],          //所有评分列表
        userScore: 4,         //当前用户的评分值（默认4星）
        average: 0,         //平均分
        rankList: []        //1-5星的占比
    }
    componentDidMount() {
        this.getScores()
    }
    /**
     * 获取评分列表
     */
    getScores = async () => {
        const res = await json.get('/score/list')
        const list = res.data || []
        const total = list.reduce((total, current) => {
            return total + current.score
        }, 0)
        const average = total * 2 / list.length
        let rankList = []
        // 因为有四舍五入的处理，所以我想最后一个数用100相减，但是js的浮点数计算是不准确的（0.1+0.3!=0.3），就没多此一举了
        for (let i = 0; i < 5; i++) {
            const num = list.filter(item => item.score === 5 - i).length / list.length
            rankList[i] = Number((num * 100).toFixed(1))    //注意toFixed方法返回的是字符串
        }
        this.setState({
            isScored: !!list.find(item => item.userId === this.props.user.id),
            scores: list,
            average: average.toFixed(1), //保留一位小数
            rankList
        })
        console.log(res)
    }
    createScore = async (num) => {
        this.setState({
            userScore: num
        })
        const res = await json.post('/score/create', {
            score: num,
            userId: this.props.user.id
        })
        if (res.status === 0) {
            this.getScores()
        }
    }
    render() {
        const { isScored, userScore, scores, average, rankList } = this.state
        const desc = ['有bug', '再接再厉', '有待提高', '不错', '666']

        const NotScore = () => (
            <div>
                <Rate
                    tooltips={desc}
                    value={userScore}
                    allowClear={false}
                    onChange={this.createScore} />
                <span style={{ color: '#888' }}>{desc[userScore - 1]}</span>
            </div>
        )
        const ScoreInfo = () => (
            <div>
                <div>
                    <div>{average}</div>
                    <div>
                        <div><Rate disabled defaultValue={4} /></div>
                        <div>{scores.length}人评价</div>
                    </div>
                    <div>
                        {rankList.map((item, index) => (
                            <div key={index}>
                                <span>{5 - index}星</span>
                                <Progress percent={item} status={'active'} strokeLinecap='square' strokeWidth={15} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
        return (
            <div>{isScored ? <ScoreInfo /> : <NotScore />}</div>
        );
    }
}


export default Score;