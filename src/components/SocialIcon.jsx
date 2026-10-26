import { SiTelegram, SiTiktok, SiXiaohongshu } from 'react-icons/si';
import { RiWechatChannelsFill } from 'react-icons/ri';

const icons = { douyin: SiTiktok, xiaohongshu: SiXiaohongshu, channels: RiWechatChannelsFill, telegram: SiTelegram };

export default function SocialIcon({ platform, ...props }) {
  const Icon = icons[platform];
  return Icon ? <Icon aria-hidden="true" {...props} /> : null;
}
