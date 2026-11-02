import { SiBilibili, SiTelegram, SiTiktok, SiXiaohongshu } from 'react-icons/si';
import { RiWechatChannelsFill } from 'react-icons/ri';

const icons = { douyin: SiTiktok, xiaohongshu: SiXiaohongshu, bilibili: SiBilibili, channels: RiWechatChannelsFill, telegram: SiTelegram };
const colors = { douyin: '#fff', xiaohongshu: '#ff2442', bilibili: '#00a1d6', channels: '#fa9d3b', telegram: '#26a5e4' };

export default function SocialIcon({ platform, style, ...props }) {
  const Icon = icons[platform];
  return Icon ? <Icon aria-hidden="true" {...props} style={{ color: colors[platform],
    ...(platform === 'douyin' ? { filter: 'drop-shadow(-1px -1px 0 #25f4ee) drop-shadow(1px 1px 0 #fe2c55)' } : {}),
    ...style }} /> : null;
}
