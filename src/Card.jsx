export default function Card({ index, id, name, img, ...props }) {
  return <img src={img} style={{ borderRadius: '0.45rem' }} {...props} />;
}
