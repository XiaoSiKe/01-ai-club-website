import { PeopleRosterPage } from './PioneersPage';
import { leadership } from './data/leadership';

const SEARCH_LABELS = {
  search: '领军团队姓名搜索',
  input: '搜索领军团队成员姓名',
  placeholder: '搜索团队成员姓名',
  results: '匹配的领军团队成员',
  empty: '没有找到相关团队成员',
};

export default function LeadershipPage() {
  return <PeopleRosterPage members={leadership} heading={'领军\n团队'} pageTitle="领军团队 · 零一 AI 日新社"
    skipLabel="跳到领军团队" rosterLabel="领军团队成员肖像墙" searchLabels={SEARCH_LABELS}
    className="leadership-page" columns={3} tabletColumns={3} portraitScale={0.924} repeatWithinColumn />;
}
