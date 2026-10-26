import EchoText from '../EchoText';
import { BRAND_ECHO_PROPS } from './EchoText/brandEchoProps';
import './BrandTitle.css';

export default function BrandTitle({ text }) {
  return <span className="brand-title"><EchoText {...BRAND_ECHO_PROPS} text={text} fontSize="inherit" /></span>;
}
