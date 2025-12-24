// src/components/contact/ContactContent.tsx
'use client';

import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, MessageCircle } from 'lucide-react';

export default function ContactContent({
  title,
  subtitle,
  address,
  email,
  phone,
  form_title,
  name,
  name_placeholder,
  message,
  message_placeholder,
  send,
}: {
  title: string;
  subtitle: string;
  address: string;
  email: string;
  phone: string;
  form_title: string;
  name: string;
  name_placeholder: string;
  message: string;
  message_placeholder: string;
  send: string;
}) {
  return (
    <div className="min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-300 text-center max-w-2xl mx-auto mb-16"
        >
          {subtitle}
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="glass-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-xl">
                  <MapPin className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{address}</h3>
                  <p className="text-gray-300">Kinshasa, RDC</p>
                </div>
              </div>
            </div>

            <div className="glass-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Mail className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{email}</h3>
                  <p className="text-gray-300">luvika@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="glass-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <Phone className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{phone}</h3>
                  <p className="text-gray-300">+243 890 17 76 601</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-border rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">{form_title}</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">{name}</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder={name_placeholder}
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">{email}</label>
                <input
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">{message}</label>
                <textarea
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder={message_placeholder}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-medium text-white flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {send}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}