UPDATE public.case_studies
SET industry = COALESCE(NULLIF(industry, ''), NULLIF(platform_used, ''), 'Case Study'),
    hero_metric_value = COALESCE(NULLIF(hero_metric_value, ''), (metrics->0->>'value')),
    hero_metric_label = COALESCE(NULLIF(hero_metric_label, ''), (metrics->0->>'label')),
    headline = COALESCE(NULLIF(headline, ''), split_part(solution, '.', 1) || '.'),
    problem_stat = COALESCE(NULLIF(problem_stat, ''), split_part(problem, '.', 1)),
    solution_stat = COALESCE(NULLIF(solution_stat, ''), split_part(solution, '.', 1)),
    result_stat = COALESCE(NULLIF(result_stat, ''), (metrics->0->>'value') || ' ' || (metrics->0->>'label')),
    cta_label = COALESCE(NULLIF(cta_label, ''), 'View Case Study');