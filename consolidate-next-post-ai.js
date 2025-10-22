const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function consolidateNextPostAIProjects() {
  try {
    console.log('🚀 Starting Next Post AI project consolidation...');

    // Step 1: Find all organizations
    console.log('📋 Finding all organizations...');
    const organizations = await prisma.organization.findMany({
      include: {
        projects: {
          include: {
            tasks: {
              include: {
                subtasks: true
              }
            },
            projectSummary: true,
            insight: true,
            AISuggestedTask: true
          }
        }
      }
    });

    console.log(`Found ${organizations.length} organizations`);

    // Step 2: Find all projects with "Next Post AI" in their name
    console.log('🔍 Finding all Next Post AI projects...');
    const nextPostAIProjects = [];
    
    for (const org of organizations) {
      const matchingProjects = org.projects.filter(project => 
        project.name.toLowerCase().includes('next post ai')
      );
      
      if (matchingProjects.length > 0) {
        console.log(`Found ${matchingProjects.length} Next Post AI project(s) in organization: ${org.name}`);
        nextPostAIProjects.push(...matchingProjects.map(project => ({
          ...project,
          originalOrgId: org.id,
          originalOrgName: org.name
        })));
      }
    }

    console.log(`Total Next Post AI projects found: ${nextPostAIProjects.length}`);

    if (nextPostAIProjects.length === 0) {
      console.log('❌ No Next Post AI projects found. Exiting...');
      return;
    }

    // Step 3: Create new "2025" organization
    console.log('🏢 Creating new "2025" organization...');
    const newOrganization = await prisma.organization.create({
      data: {
        name: '2025',
        type: 'workspace',
        field: 'consolidated',
        need: 'Next Post AI project consolidation'
      }
    });

    console.log(`✅ Created organization: ${newOrganization.name} (ID: ${newOrganization.id})`);

    // Step 4: Consolidate all Next Post AI projects
    console.log('🔄 Consolidating projects...');
    
    for (const project of nextPostAIProjects) {
      console.log(`Processing project: ${project.name} from ${project.originalOrgName}`);
      
      // Create the consolidated project
      const consolidatedProject = await prisma.project.create({
        data: {
          name: project.name,
          description: project.description,
          goal: project.goal,
          focusArea: project.focusArea,
          mainGoal: project.mainGoal,
          organizationId: newOrganization.id,
          hasAiSuggestTasks: project.hasAiSuggestTasks,
          createdAt: project.createdAt,
          updatedAt: new Date()
        }
      });

      console.log(`  ✅ Created consolidated project: ${consolidatedProject.name}`);

      // Copy tasks and subtasks
      for (const task of project.tasks) {
        const consolidatedTask = await prisma.task.create({
          data: {
            name: task.name,
            description: task.description,
            projectId: consolidatedProject.id,
            hasAISuggestions: task.hasAISuggestions,
            createdAt: task.createdAt,
            updatedAt: new Date()
          }
        });

        console.log(`    ✅ Created task: ${consolidatedTask.name}`);

        // Copy subtasks
        for (const subtask of task.subtasks) {
          await prisma.subtask.create({
            data: {
              name: subtask.name,
              taskId: consolidatedTask.id,
              assignedUserId: subtask.assignedUserId,
              dueDate: subtask.dueDate,
              points: subtask.points,
              status: subtask.status,
              priority: subtask.priority,
              tagName: subtask.tagName,
              tagColor: subtask.tagColor,
              createdAt: subtask.createdAt,
              updatedAt: new Date(),
              completedAt: subtask.completedAt
            }
          });

          console.log(`      ✅ Created subtask: ${subtask.name}`);
        }
      }

      // Copy AI suggested tasks
      for (const aiTask of project.AISuggestedTask) {
        await prisma.aISuggestedTask.create({
          data: {
            name: aiTask.name,
            description: aiTask.description,
            projectId: consolidatedProject.id,
            createdAt: aiTask.createdAt
          }
        });

        console.log(`    ✅ Created AI suggested task: ${aiTask.name}`);
      }

      // Copy project summary if it exists
      if (project.projectSummary && project.projectSummary.length > 0) {
        const summary = project.projectSummary[0];
        await prisma.projectSummary.create({
          data: {
            projectId: consolidatedProject.id,
            prompt: summary.prompt,
            response: summary.response,
            done: summary.done,
            pending: summary.pending,
            createdAt: summary.createdAt,
            updatedAt: new Date()
          }
        });

        console.log(`    ✅ Created project summary`);
      }

      // Copy insights if they exist
      if (project.insight && project.insight.length > 0) {
        const insight = project.insight[0];
        await prisma.insight.create({
          data: {
            projectId: consolidatedProject.id,
            insights: insight.insights,
            desiredOutcome: insight.desiredOutcome,
            updatedAt: new Date()
          }
        });

        console.log(`    ✅ Created project insights`);
      }
    }

    // Step 5: Summary
    console.log('\n🎉 Consolidation completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`  - Organizations processed: ${organizations.length}`);
    console.log(`  - Next Post AI projects found: ${nextPostAIProjects.length}`);
    console.log(`  - New organization created: ${newOrganization.name}`);
    console.log(`  - Consolidated project ID: ${newOrganization.id}`);
    
    console.log('\n📋 Projects consolidated:');
    nextPostAIProjects.forEach((project, index) => {
      console.log(`  ${index + 1}. ${project.name} (from ${project.originalOrgName})`);
    });

    console.log('\n✅ You can now check the UI to see the new "2025" organization with all consolidated Next Post AI projects!');

  } catch (error) {
    console.error('❌ Error during consolidation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the consolidation
consolidateNextPostAIProjects()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
