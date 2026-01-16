 <!-- Navbar -->
    <nav id="navbar" class="navbar-normal fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div class="container mx-auto px-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img
            src="https://apilageai.lk/assets/images/icon.png"
            alt="ApilageAI Logo"
            class="w-10 h-10 object-contain hover:rotate-6 transition-transform duration-300"
          />
          <span class="text-xl font-bold font-display text-brand-dark tracking-tight">
            Apilage<span class="text-brand-red underline decoration-wavy decoration-2 underline-offset-4">AI</span>
          </span>
        </div>

        <div class="hidden md:flex items-center gap-8 text-sm font-bold text-brand-dark/80">
          <a href="#features" class="hover:text-brand-red hover:underline decoration-2 underline-offset-4 transition-all">Features</a>
          <a href="#pricing" class="hover:text-brand-red hover:underline decoration-2 underline-offset-4 transition-all">Pricing</a>
          <a href="#developers" class="hover:text-brand-red hover:underline decoration-2 underline-offset-4 transition-all">Developers</a>
          <a href="https://apilageai.lk/blog" class="hover:text-brand-red hover:underline decoration-2 underline-offset-4 transition-all">Blog</a>
        </div>

        <div class="flex items-center gap-4">
          <a href="https://apilageai.lk/app" class="btn-primary !py-2 !px-5 !text-sm">Start Chat</a>
        </div>
      </div>
    </nav>

    <div class="min-h-screen bg-white bg-grid-pattern text-brand-dark font-sans selection:bg-brand-red selection:text-white">
      <!-- Hero Section -->
      <section class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div class="container mx-auto px-6 relative z-10">
          <div class="flex flex-col lg:flex-row items-center gap-16">

            <!-- Hero Text -->
            <div class="flex-1 text-center lg:text-left relative">
              <div class="absolute -top-16 left-0 hidden lg:block animate-bounce">
                <svg class="w-16 h-16 text-brand-blue" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>

              <div class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blueLight border-2 border-brand-dark text-brand-dark text-sm font-bold mb-6 rotate-[-2deg] shadow-hard-sm">
                <div class="w-3 h-3 bg-brand-red rounded-full animate-bounce"></div>
                <span class="font-hand text-lg">Sri Lanka's First Native AI Platform 🇱🇰</span>
              </div>

              <h1 class="text-6xl lg:text-8xl font-display font-black tracking-tighter text-brand-dark leading-[0.9] mb-6">
                අපිලගේ <br/>
                <span class="relative inline-block text-brand-blue">
                  AI
                  <svg class="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 200 9" fill="none">
                    <path d="M2.00026 6.99997C58.435 1.83331 145.002 -3.49999 198.002 4.99998" stroke="#FF3B30" stroke-width="3" stroke-linecap="round"/>
                  </svg>
                </span>
              </h1>

              <p class="text-xl text-brand-dark/70 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Meet <span class="font-bold text-brand-dark">ApilageAI</span>. The AI that actually understands us. Mindmaps, Flowcharts, and Sinhala/English support built right in.
              </p>

              <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a href="https://apilageai.lk/app" class="btn-primary w-full sm:w-auto text-lg">
                  Start Learning Free
                  <svg class="w-5 h-5 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
                <a href="https://api.apilageai.lk" class="btn-secondary w-full sm:w-auto text-lg">Try API</a>
              </div>

              <div class="mt-12 flex items-center justify-center lg:justify-start gap-6">
                 <p class="font-hand text-xl text-brand-dark/50 rotate-1">Trusted by 1000+ Students!</p>
              </div>
            </div>

            <!-- Hero Demo -->
            <div class="flex-1 w-full max-w-md lg:max-w-full relative" id="demo">
              <div class="absolute -right-10 -top-10 hidden lg:block animate-bounce">
                <span class="font-hand font-bold text-2xl bg-white border-2 border-brand-dark px-4 py-2 rounded-full shadow-hard-sm rotate-12 text-brand-dark">Try me! 👇</span>
              </div>
              <!-- Chat Demo Component -->
              <div class="chat-window">
                <div class="bg-white border-b-2 border-brand-dark p-3 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-brand-red border-2 border-brand-dark rounded flex items-center justify-center">
                      <svg class="text-white w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                      </svg>
                    </div>
                    <span class="font-bold font-display text-sm text-brand-dark">Apilage Chat</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 border-2 border-brand-dark flex items-center justify-center hover:bg-brand-blueLight cursor-pointer rounded-sm">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </div>
                    <div class="w-6 h-6 border-2 border-brand-dark flex items-center justify-center hover:bg-brand-blueLight cursor-pointer rounded-sm">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      </svg>
                    </div>
                    <div class="w-6 h-6 border-2 border-brand-dark flex items-center justify-center bg-brand-red text-white hover:bg-red-600 cursor-pointer rounded-sm">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div id="chat-messages" class="chat-messages">
                  <div class="message-model">
                    <div class="message-bubble">
                      <p>Yo! 👋 I'm Apilageai I can help you crush your homework. What are we working on?</p>
                    </div>
                  </div>
                </div>

                <form id="chat-form" class="p-3 bg-white border-t-2 border-brand-dark">
                  <div class="relative flex items-center gap-2">
                    <input
                      id="chat-input"
                      type="text"
                      placeholder="Ask anything..."
                      class="flex-1 bg-brand-blueLight border-2 border-brand-dark text-brand-dark rounded-lg py-2 px-4 focus:outline-none focus:shadow-hard-sm transition-all placeholder:text-brand-dark/40 font-medium"
                    />
                    <button
                      type="submit"
                      class="p-2.5 bg-brand-red text-white rounded-lg border-2 border-brand-dark hover:shadow-hard-sm active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>