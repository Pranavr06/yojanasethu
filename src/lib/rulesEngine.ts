import { FullStudentProfile, PlacementDrive, CandidateEvaluation } from '@/types';

/**
 * 1. DETERMINISTIC ACADEMIC PLANNER (Contineo ERP & CGPA Math)
 * Formula: Required SGPA = (Target CGPA * Total Credits - Current CGPA * Earned Credits) / Remaining Credits
 */
export function calculateTargetSgpa(
  currentCgpa: number,
  targetCgpa: number,
  earnedCredits: number = 120,
  totalCredits: number = 160
) {
  const remainingCredits = Math.max(1, totalCredits - earnedCredits);
  const totalPointsNeeded = targetCgpa * totalCredits;
  const currentPointsEarned = currentCgpa * earnedCredits;
  const pointsRemaining = totalPointsNeeded - currentPointsEarned;
  const rawRequiredSgpa = pointsRemaining / remainingCredits;
  const requiredSgpa = Math.round(rawRequiredSgpa * 100) / 100;

  let difficulty: 'impossible' | 'hard_push' | 'challenging' | 'achievable' | 'already_achieved';
  let advice: string;

  if (targetCgpa <= currentCgpa) {
    difficulty = 'already_achieved';
    advice = `Target CGPA of ${targetCgpa.toFixed(2)} is already reached! Maintaining an SGPA of ${currentCgpa.toFixed(2)} keeps you in top standing.`;
  } else if (rawRequiredSgpa > 10.0) {
    difficulty = 'impossible';
    const maxPossibleCgpa = ((currentPointsEarned + 10.0 * remainingCredits) / totalCredits).toFixed(2);
    advice = `Mathematically unachievable: Reaching ${targetCgpa.toFixed(2)} would require an SGPA of ${requiredSgpa.toFixed(2)} (>10.0 max). Max possible CGPA with straight 10.0s is ${maxPossibleCgpa}.`;
  } else if (rawRequiredSgpa >= 9.0) {
    difficulty = 'hard_push';
    advice = `High-intensity target: Requires an outstanding SGPA of ${requiredSgpa.toFixed(2)} across remaining ${remainingCredits} credits. Focus on high-credit core labs and theory.`;
  } else if (rawRequiredSgpa >= 8.0) {
    difficulty = 'challenging';
    advice = `Challenging but very achievable: Average SGPA of ${requiredSgpa.toFixed(2)} in remaining semesters will elevate your CGPA to ${targetCgpa.toFixed(2)}.`;
  } else {
    difficulty = 'achievable';
    advice = `Smoothly reachable: Target an SGPA of ${Math.max(currentCgpa, requiredSgpa).toFixed(2)} to reach your goal.`;
  }

  return {
    currentCgpa,
    targetCgpa,
    earnedCredits,
    remainingCredits,
    totalCredits,
    requiredSgpa: Math.min(10.0, Math.max(0, requiredSgpa)),
    rawRequiredSgpa,
    difficulty,
    isAchievable: rawRequiredSgpa <= 10.0,
    advice,
  };
}

/**
 * 2. DETERMINISTIC PLACEMENT DRIVE ELIGIBILITY FILTER
 * Matches academic_records from Contineo ERP against recruiter placement_drives
 */
export function checkDriveEligibility(student: FullStudentProfile, drive: PlacementDrive) {
  const reasons: string[] = [];
  const branch = student.profile.department_code || 'ISE';
  const cgpa = student.academic_record?.cgpa ?? 0;
  const backlogs = student.academic_record?.active_backlogs ?? 0;
  const gradYear = student.profile.graduation_year;

  if (!student.academic_record) {
    reasons.push('Academic record not yet synchronized from ERP');
  }

  // Branch check
  if (drive.eligible_branches && drive.eligible_branches.length > 0) {
    const isBranchAllowed = drive.eligible_branches.some(
      (b) => b.toUpperCase() === branch.toUpperCase()
    );
    if (!isBranchAllowed) {
      reasons.push(`Branch ${branch} not in eligible list (${drive.eligible_branches.join(', ')})`);
    }
  }

  // CGPA Cutoff
  if (cgpa < drive.min_cgpa) {
    reasons.push(`CGPA ${cgpa.toFixed(2)} below minimum cutoff of ${drive.min_cgpa.toFixed(2)}`);
  }

  // Batch Year
  if (drive.batch_year && gradYear && gradYear !== drive.batch_year) {
    reasons.push(`Graduation year ${gradYear} does not match drive requirement (${drive.batch_year})`);
  }

  // Backlogs
  if (backlogs > drive.max_active_backlogs) {
    reasons.push(`Has ${backlogs} active backlog(s); drive permits maximum ${drive.max_active_backlogs}`);
  }

  return {
    isEligible: reasons.length === 0,
    disqualificationReason: reasons.join('; '),
  };
}

/**
 * 3. EVIDENCE-WEIGHTED CANDIDATE MATCHING
 * Skills verified by faculty mentor in student_skill_passport get +2 weight.
 * Unverified / Self-declared claims get +1 weight.
 */
export function evaluateDriveCandidate(
  student: FullStudentProfile,
  drive: PlacementDrive
): CandidateEvaluation {
  const { isEligible, disqualificationReason } = checkDriveEligibility(student, drive);

  const requiredSkills = drive.required_skills || [
    { name: 'Python', importance: 'mandatory', weight: 3 },
    { name: 'SQL', importance: 'mandatory', weight: 2 },
    { name: 'PyTorch', importance: 'preferred', weight: 2 },
    { name: 'Data Analysis', importance: 'mandatory', weight: 2 },
  ];

  let totalMaxScore = 0;
  let candidateEarnedScore = 0;
  let verifiedCount = 0;
  let claimedCount = 0;
  let missingCount = 0;

  const skillBreakdown = requiredSkills.map((req) => {
    const weight = req.weight || 2;
    const maxSkillScore = weight * 2;
    totalMaxScore += maxSkillScore;

    const matchedPassportSkill = student.skills.find(
      (s) => s.skill_name.toLowerCase() === req.name.toLowerCase()
    );

    if (!matchedPassportSkill) {
      missingCount++;
      return {
        skill_name: req.name,
        required_importance: req.importance,
        weight,
        tier: 'missing' as const,
        verification_badge: false,
        evidence_url: null,
        status: 'missing' as const,
      };
    }

    // FACULTY MENTOR VERIFIED GATE:
    if (matchedPassportSkill.verification_badge && matchedPassportSkill.tier === 'evidenced') {
      candidateEarnedScore += weight * 2;
      verifiedCount++;
      return {
        skill_name: req.name,
        required_importance: req.importance,
        weight,
        tier: 'evidenced' as const,
        verification_badge: true,
        evidence_url: matchedPassportSkill.evidence_url,
        status: 'verified' as const,
      };
    } else {
      // Self-declared claim without faculty approval
      candidateEarnedScore += weight * 1;
      claimedCount++;
      return {
        skill_name: req.name,
        required_importance: req.importance,
        weight,
        tier: 'self_declared' as const,
        verification_badge: false,
        evidence_url: null,
        status: 'claimed' as const,
      };
    }
  });

  const rawPercentage = totalMaxScore > 0 ? (candidateEarnedScore / totalMaxScore) * 100 : 0;
  const matchScore = Math.round(rawPercentage);

  let explanation = '';
  if (!isEligible) {
    explanation = `Candidate does not meet Contineo ERP hard criteria: ${disqualificationReason}`;
  } else if (verifiedCount === requiredSkills.length) {
    explanation = `Exceptional fit: All ${verifiedCount} skills verified with endorsed faculty reviews.`;
  } else if (verifiedCount > 0) {
    const verifiedNames = skillBreakdown.filter((s) => s.status === 'verified').map((s) => s.skill_name).join(', ');
    const claimedNames = skillBreakdown.filter((s) => s.status === 'claimed').map((s) => s.skill_name).join(', ');
    const missingNames = skillBreakdown.filter((s) => s.status === 'missing').map((s) => s.skill_name).join(', ');

    let parts = [`Faculty Endorsed: [${verifiedNames}].`];
    if (claimedNames) parts.push(`Unverified Claims: [${claimedNames}].`);
    if (missingNames) parts.push(`Missing: [${missingNames}].`);
    explanation = parts.join(' ');
  } else {
    explanation = `Meets academic cutoffs, but 0 skills have been verified by college faculty. All skills are self-declared.`;
  }

  return {
    student,
    is_eligible: isEligible,
    disqualification_reason: disqualificationReason,
    match_score: matchScore,
    verified_count: verifiedCount,
    claimed_count: claimedCount,
    missing_count: missingCount,
    skill_breakdown: skillBreakdown,
    explanation,
  };
}
