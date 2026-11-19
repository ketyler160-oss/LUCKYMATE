import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Gift,
  Link2,
  Lock,
  RefreshCw,
  Share2,
  Users,
  Wallet,
} from 'lucide-react';
import { buildReferralShareUrl } from '../lib/api';
import {
  REFERRAL_MIN_DEPOSIT_USD,
  REFERRAL_REWARD_USD,
  convertUsdToLocal,
  formatDirectLocalMoney,
  formatMoney,
} from '../lib/countries';
import { CountryOption, ReferralSummary } from '../types';

async function copyTextSafe(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export function ReferralRegistrationBanner({
  referralCode,
  country,
}: {
  referralCode: string;
  country: CountryOption;
}) {
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const shareUrl = buildReferralShareUrl(referralCode);
  const rewardLocal = formatDirectLocalMoney(
    convertUsdToLocal(REFERRAL_REWARD_USD, country),
    country
  );
  const depositLocal = formatDirectLocalMoney(
    convertUsdToLocal(REFERRAL_MIN_DEPOSIT_USD, country),
    country
  );
  const shareText = `Join me on Luckymate Sportsbook & Casino! Register with my link and deposit $${REFERRAL_MIN_DEPOSIT_USD}.00 USD (${depositLocal}) to start playing: ${shareUrl}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopy = async () => {
    const ok = await copyTextSafe(shareUrl);
    if (ok) {
      setCopied(true);
      setShareFeedback(null);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Join Luckymate',
          text: 'Register on Luckymate using my invite link:',
          url: shareUrl,
        });
        setShareFeedback('Invite shared!');
        window.setTimeout(() => setShareFeedback(null), 2200);
        return;
      } catch {
        // User cancelled or share blocked in iframe; fall back to copy
      }
    }
    const ok = await copyTextSafe(shareUrl);
    if (ok) {
      setCopied(true);
      setShareFeedback('Link copied — paste to send to a friend');
      window.setTimeout(() => {
        setCopied(false);
        setShareFeedback(null);
      }, 2400);
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-[#2d5a3b] bg-[#0e1f18] p-3.5 space-y-2.5">
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#7bc114]/20 text-[#98e02a]">
          <Gift className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-white">
            Your Personal Luckymate Invite Link — Earn ${REFERRAL_REWARD_USD}.00 USD ({rewardLocal})
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-[#cbd5e1]">
            Share this link with friends. Once a friend joins and deposits{' '}
            <strong className="text-[#f5c417]">${REFERRAL_MIN_DEPOSIT_USD}.00 USD</strong> (
            {depositLocal}), you earn{' '}
            <strong className="text-[#98e02a]">${REFERRAL_REWARD_USD}.00 USD</strong>. Deposit{' '}
            <strong className="text-[#f5c417]">${REFERRAL_MIN_DEPOSIT_USD}.00 USD</strong> into your
            Real Account to unlock and add your bonus to your Real Balance.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 rounded-lg border border-[#244734] bg-[#091410] px-2.5 py-2">
        <Link2 className="h-3.5 w-3.5 shrink-0 text-[#7bc114]" aria-hidden="true" />
        <input
          type="text"
          readOnly
          value={shareUrl}
          aria-label="Your referral invite link"
          onFocus={(e) => e.currentTarget.select()}
          className="w-full min-w-0 bg-transparent font-mono text-[11px] text-[#e2e8f0] focus:outline-none"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#7bc114] px-2.5 py-1.5 text-[11px] font-extrabold text-[#0b1404] hover:bg-[#8cd61e] cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-bold text-[#94a3b8]">
          CODE: <strong className="text-[#f5c417]">{referralCode}</strong>
        </span>
        <div className="flex items-center gap-1.5">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-[#2b5e3f] bg-[#143322] px-2.5 py-1 text-[11px] font-bold text-[#8ef7ce] hover:bg-[#1a432d]"
          >
            WhatsApp
          </a>
          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex items-center gap-1 rounded-md border border-[#2d3e52] bg-[#162231] px-2.5 py-1 text-[11px] font-bold text-white hover:border-[#7bc114] cursor-pointer"
          >
            <Share2 className="h-3 w-3" aria-hidden="true" />
            Share
          </button>
        </div>
      </div>

      {shareFeedback && (
        <p className="text-[11px] font-semibold text-[#98e02a]">{shareFeedback}</p>
      )}
    </div>
  );
}

export function ReferralProgramCard({
  referralCode,
  summary,
  country,
  onRefresh,
  onOpenDeposit,
}: {
  referralCode: string;
  summary: ReferralSummary | null;
  country: CountryOption;
  onRefresh?: () => Promise<void>;
  onOpenDeposit?: () => void;
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const activeCode = summary?.referralCode || referralCode;
  const shareUrl = activeCode ? buildReferralShareUrl(activeCode) : '';
  const rewardUsd = summary?.rewardUsd ?? REFERRAL_REWARD_USD;
  const minDepositUsd = summary?.minDepositUsd ?? REFERRAL_MIN_DEPOSIT_USD;
  const rewardLocal = formatDirectLocalMoney(convertUsdToLocal(rewardUsd, country), country);
  const minDepositLocal = formatDirectLocalMoney(
    convertUsdToLocal(minDepositUsd, country),
    country
  );

  const shareText = `Join me on Luckymate! Register with my link and deposit $${minDepositUsd}.00 USD (${minDepositLocal}) to play Sports & Crash Games: ${shareUrl}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    const ok = await copyTextSafe(shareUrl);
    if (ok) {
      setCopiedLink(true);
      setShareNote(null);
      window.setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleCopyCode = async () => {
    if (!activeCode) return;
    const ok = await copyTextSafe(activeCode);
    if (ok) {
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!shareUrl) return;
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Join Luckymate',
          text: 'Register on Luckymate with my invite link:',
          url: shareUrl,
        });
        setShareNote('Invite link shared!');
        window.setTimeout(() => setShareNote(null), 2400);
        return;
      } catch {
        // Fallback to clipboard copy
      }
    }
    const ok = await copyTextSafe(shareUrl);
    if (ok) {
      setCopiedLink(true);
      setShareNote('Invite link copied to clipboard — paste it to your friend.');
      window.setTimeout(() => {
        setCopiedLink(false);
        setShareNote(null);
      }, 2600);
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const referrals = summary?.referrals ?? [];
  const totalInvited = summary?.totalInvited ?? 0;
  const pendingCount = summary?.pendingCount ?? 0;
  const qualifiedCount = summary?.qualifiedCount ?? 0;
  const awaitingClaimCount = summary?.awaitingClaimCount ?? 0;
  const totalEarnedBase = summary?.totalEarnedBase ?? 0;
  const totalEarnedUsd = summary?.totalEarnedUsd ?? 0;
  const pendingBonusBase = summary?.pendingBonusBase ?? 0;
  const pendingBonusUsd = summary?.pendingBonusUsd ?? 0;
  const hasQualifyingRealDeposit = summary?.hasQualifyingRealDeposit ?? false;

  return (
    <section
      aria-label="Invite Friends and Earn Referral Rewards"
      className="lm-card rounded-2xl p-5 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#183044] pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#2f6b47] bg-[#0f291c] text-[#7bc114]">
            <Gift className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-extrabold text-white">
                Invite Friends &amp; Earn ${rewardUsd}.00 USD
              </h3>
              <span className="rounded-md bg-[#7bc114]/20 px-2 py-0.5 font-mono text-[10px] font-extrabold text-[#98e02a]">
                +{rewardLocal} / friend
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#9fb3c8]">
              Share your personal Luckymate link. When a friend joins and deposits{' '}
              <strong className="text-[#f5c417]">
                ${minDepositUsd}.00 USD ({minDepositLocal})
              </strong>
              , you earn{' '}
              <strong className="text-[#2cd4a3]">
                ${rewardUsd}.00 USD ({rewardLocal})
              </strong>
              . Make a{' '}
              <strong className="text-white">${minDepositUsd}.00 USD</strong> real deposit on your
              own account to unlock and add earned referral bonuses straight into your Real Balance.
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#243d56] bg-[#0a1524] px-3 py-1.5 text-[11px] font-bold text-[#cbd5e1] hover:border-[#2cd4a3] hover:text-white cursor-pointer disabled:opacity-60"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-[#2cd4a3]' : ''}`}
              aria-hidden="true"
            />
            Refresh
          </button>
        )}
      </div>

      {/* Pending / Locked Referral Bonus Unlock Banner */}
      {pendingBonusUsd > 0 && (
        <div className="rounded-xl border border-[#f5c417]/50 bg-[#221b09] p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5c417]/20 text-[#f5c417]">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#f5c417]">
                Bonus Ready to Claim: ${pendingBonusUsd.toFixed(2)} USD (
                {formatMoney(pendingBonusBase, country)})
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#e2e8f0]">
                {awaitingClaimCount === 1
                  ? 'Your invited friend deposited $6.00+ USD!'
                  : `${awaitingClaimCount} invited friends deposited $6.00+ USD!`}{' '}
                Deposit{' '}
                <strong className="text-[#f5c417]">
                  ${minDepositUsd}.00 USD ({minDepositLocal})
                </strong>{' '}
                into your Real Account now so your{' '}
                <strong className="text-[#98e02a]">${pendingBonusUsd.toFixed(2)} USD</strong> bonus
                is added straight to your balance.
              </p>
            </div>
          </div>

          {onOpenDeposit && (
            <button
              type="button"
              onClick={onOpenDeposit}
              className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#f5c417] px-4 py-2 text-xs font-extrabold text-[#111827] hover:bg-[#fae07d] cursor-pointer"
            >
              <Wallet className="h-4 w-4" aria-hidden="true" />
              Deposit ${minDepositUsd}.00 USD &amp; Claim
            </button>
          )}
        </div>
      )}

      {/* Account Deposit Eligibility Strip (when no locked bonus yet, but referrer hasn't deposited $6 yet) */}
      {pendingBonusUsd === 0 && !hasQualifyingRealDeposit && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#243d56] bg-[#0a1524] px-3.5 py-2.5 text-xs">
          <span className="text-[#cbd5e1]">
            <strong className="text-[#f5c417]">Activation Requirement:</strong> Deposit at least{' '}
            <strong className="text-white">
              ${minDepositUsd}.00 USD ({minDepositLocal})
            </strong>{' '}
            so your referral bonuses automatically add to your Real Balance.
          </span>
          {onOpenDeposit && (
            <button
              type="button"
              onClick={onOpenDeposit}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#f5c417]/50 bg-[#1f1a0a] px-3 py-1.5 text-[11px] font-extrabold text-[#f5c417] hover:bg-[#2b240e] cursor-pointer shrink-0"
            >
              <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
              Deposit ${minDepositUsd} USD
            </button>
          )}
        </div>
      )}

      {/* Shareable Referral Link Box */}
      <div className="rounded-xl border border-[#214536] bg-[#0a1a16] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8ef7ce]">
            Your Unique Luckymate Invite Link
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#2a4a3d] bg-[#0d221c] px-2.5 py-1 font-mono text-[11px] font-bold text-[#f5c417] hover:border-[#f5c417] cursor-pointer"
          >
            <span>Code: {activeCode}</span>
            {copiedCode ? (
              <Check className="h-3 w-3 text-[#2cd4a3]" aria-hidden="true" />
            ) : (
              <Copy className="h-3 w-3 text-[#94a3b8]" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#23483b] bg-[#06120f] px-3 py-2.5 min-w-0">
            <Link2 className="h-4 w-4 shrink-0 text-[#2cd4a3]" aria-hidden="true" />
            <input
              type="text"
              readOnly
              value={shareUrl}
              aria-label="Personal referral link"
              onFocus={(e) => e.currentTarget.select()}
              className="w-full min-w-0 bg-transparent font-mono text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex min-h-[42px] flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg bg-[#7bc114] px-4 py-2 text-xs font-extrabold text-[#0b1404] hover:bg-[#8cd61e] cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Link Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  Copy Link
                </>
              )}
            </button>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg border border-[#2d6a47] bg-[#123823] px-3.5 py-2 text-xs font-extrabold text-[#8ef7ce] hover:bg-[#184a2f]"
            >
              WhatsApp
            </a>

            <button
              type="button"
              onClick={handleShare}
              aria-label="Share invite link"
              className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg border border-[#2a425b] bg-[#0d1c2e] px-3.5 py-2 text-xs font-bold text-white hover:border-[#2cd4a3] cursor-pointer"
            >
              <Share2 className="h-4 w-4 text-[#2cd4a3]" aria-hidden="true" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {shareNote && <p className="text-xs font-semibold text-[#2cd4a3]">{shareNote}</p>}
      </div>

      {/* 3-Step How It Works */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-xs">
        <div className="rounded-xl border border-[#1b354b] bg-[#0a1421] p-3">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#7bc114]/20 font-mono text-[11px] font-black text-[#98e02a]">
            1
          </span>
          <p className="mt-1.5 font-bold text-white">Share Your Luckymate Link</p>
          <p className="mt-0.5 text-[11px] text-[#8bb0ab]">
            Send your personal link to friends on WhatsApp, SMS, or social media.
          </p>
        </div>

        <div className="rounded-xl border border-[#1b354b] bg-[#0a1421] p-3">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#f5c417]/20 font-mono text-[11px] font-black text-[#f5c417]">
            2
          </span>
          <p className="mt-1.5 font-bold text-white">Friend Deposits ${minDepositUsd}.00 USD</p>
          <p className="mt-0.5 text-[11px] text-[#8bb0ab]">
            Your friend joins via your link and deposits ${minDepositUsd}.00+ USD ({minDepositLocal}
            ) to trigger your ${rewardUsd}.00 USD bonus.
          </p>
        </div>

        <div className="rounded-xl border border-[#1b354b] bg-[#0a1421] p-3">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#2cd4a3]/20 font-mono text-[11px] font-black text-[#2cd4a3]">
            3
          </span>
          <p className="mt-1.5 font-bold text-white">Deposit ${minDepositUsd}.00 USD to Claim</p>
          <p className="mt-0.5 text-[11px] text-[#8bb0ab]">
            Once you deposit ${minDepositUsd}.00 USD on your account, every ${rewardUsd}.00 USD (
            {rewardLocal}) bonus is added directly to your Real Balance.
          </p>
        </div>
      </div>

      {/* Live Stats Strip */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 text-xs">
        <div className="rounded-xl border border-[#1b354b] bg-[#0a1421] p-3">
          <p className="text-[11px] text-[#8bb0ab]">Friends Joined</p>
          <p className="mt-1 font-mono text-lg font-extrabold text-white tabular-nums">
            {totalInvited}
          </p>
        </div>
        <div className="rounded-xl border border-[#1b354b] bg-[#0a1421] p-3">
          <p className="text-[11px] text-[#8bb0ab]">
            {pendingBonusUsd > 0 ? 'Waiting Your $6 Deposit' : `Pending $${minDepositUsd} Deposit`}
          </p>
          {pendingBonusUsd > 0 ? (
            <>
              <p className="mt-1 font-mono text-sm font-extrabold text-[#f5c417] tabular-nums">
                ${pendingBonusUsd.toFixed(2)} USD
              </p>
              <p className="font-mono text-[10px] text-[#8bb0ab] tabular-nums">
                {awaitingClaimCount} ready to claim
              </p>
            </>
          ) : (
            <p className="mt-1 font-mono text-lg font-extrabold text-[#f5c417] tabular-nums">
              {pendingCount}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-[#1b354b] bg-[#0a1421] p-3">
          <p className="text-[11px] text-[#8bb0ab]">Qualified &amp; Paid</p>
          <p className="mt-1 font-mono text-lg font-extrabold text-[#2cd4a3] tabular-nums">
            {qualifiedCount}
          </p>
        </div>
        <div className="rounded-xl border border-[#1b354b] bg-[#0a1421] p-3">
          <p className="text-[11px] text-[#8bb0ab]">Added to Balance</p>
          <p className="mt-1 font-mono text-sm font-extrabold text-[#98e02a] tabular-nums">
            ${totalEarnedUsd.toFixed(2)} USD
          </p>
          <p className="font-mono text-[10px] text-[#8bb0ab] tabular-nums">
            {formatMoney(totalEarnedBase, country)}
          </p>
        </div>
      </div>

      {/* Invited Friends List */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Users className="h-4 w-4 text-[#2cd4a3]" aria-hidden="true" />
            <span>Invited Friends ({referrals.length})</span>
          </div>
          <span className="text-[11px] text-[#8bb0ab]">
            {hasQualifyingRealDeposit
              ? `Account activated · Bonuses credit immediately`
              : `Deposit $${minDepositUsd}.00 USD to unlock earned bonuses`}
          </span>
        </div>

        {referrals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#243d56] bg-[#08121f] px-4 py-6 text-center">
            <p className="text-xs font-bold text-white">No friends invited yet</p>
            <p className="mt-1 text-[11px] text-[#8bb0ab]">
              Copy and share your Luckymate invite link above. When a friend joins with it, they
              will appear here immediately.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#183044] rounded-xl border border-[#1b354b] bg-[#091320]">
            {referrals.map((item) => {
              const rewarded = item.status === 'rewarded';
              const awaitingReferrer = item.status === 'awaiting_referrer_deposit';
              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-white">
                      {item.referredUsername}{' '}
                      <span className="font-mono text-[11px] font-normal text-[#8bb0ab]">
                        ({item.maskedPhone})
                      </span>
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#6b8299]">
                      Joined{' '}
                      {new Date(item.joinedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {rewarded && typeof item.qualifyingDepositUsd === 'number'
                        ? ` · Friend deposited $${item.qualifyingDepositUsd.toFixed(2)} USD`
                        : awaitingReferrer && typeof item.qualifyingDepositUsd === 'number'
                        ? ` · Friend deposited $${item.qualifyingDepositUsd.toFixed(2)} USD · Deposit $${minDepositUsd}.00 USD to claim`
                        : ` · Waiting for friend's $${minDepositUsd}.00 USD deposit`}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    {rewarded ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-[#2cd4a3]/40 bg-[#0d2b22] px-2.5 py-1 font-mono text-[11px] font-extrabold text-[#2cd4a3]">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        +${item.rewardUsd.toFixed(2)} USD Added
                      </span>
                    ) : awaitingReferrer ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-[#f5c417]/50 bg-[#2b2209] px-2.5 py-1 text-[11px] font-extrabold text-[#f5c417]">
                        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                        +${item.rewardUsd.toFixed(2)} Ready · Deposit ${minDepositUsd}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md border border-[#334155] bg-[#131d2b] px-2.5 py-1 text-[11px] font-bold text-[#cbd5e1]">
                        <Clock className="h-3.5 w-3.5 text-[#f5c417]" aria-hidden="true" />
                        Pending ${minDepositUsd} Deposit
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
