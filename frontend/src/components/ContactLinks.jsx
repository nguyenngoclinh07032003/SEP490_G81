import { useState } from 'react';
import Icon from './Icon.jsx';
import { contact } from '../data/contact.js';

export default function ContactLinks() {
  const [notice, setNotice] = useState('');
  const channels = [
    { name: 'Zalo', className: 'zalo', href: contact.zaloUrl, icon: <span className="zalo-wordmark" aria-hidden="true">Zalo</span> },
    { name: 'Facebook', className: 'facebook', href: contact.facebookUrl, icon: <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.5 22v-9h3l.5-3.5h-3.5V7.25c0-1 .3-1.75 1.8-1.75H17V2.4c-.7-.1-1.6-.2-2.7-.2-2.7 0-4.3 1.7-4.3 4.6v2.7H7V13h3v9z" /></svg> },
    { name: contact.phone, className: 'telephone', href: `tel:${contact.phone}`, icon: <Icon name="call" /> },
  ];

  return (
    <aside className="contact-widget" aria-label="Liên hệ Minh Đức">
      {notice && <div className="contact-notice" role="status"><span>{notice}</span><button type="button" aria-label="Đóng thông báo liên hệ" onClick={() => setNotice('')}><Icon name="close" /></button></div>}
      <div className="contact-channels">
        {channels.map(channel => {
          const label = channel.className === 'telephone' ? `Gọi ${channel.name}` : `Liên hệ qua ${channel.name}`;
          const content = <><span className="contact-symbol">{channel.icon}</span><span className="contact-label">{channel.name}</span></>;
          return channel.href ? (
            <a key={channel.name} className={`contact-channel ${channel.className}`} href={channel.href} aria-label={label} title={label} {...(channel.className !== 'telephone' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{content}</a>
          ) : (
            <button key={channel.name} className={`contact-channel ${channel.className}`} type="button" aria-label={label} title={label} onClick={() => setNotice(`Thông tin ${channel.name} của Minh Đức sẽ được cập nhật sớm.`)}>{content}</button>
          );
        })}
      </div>
    </aside>
  );
}
